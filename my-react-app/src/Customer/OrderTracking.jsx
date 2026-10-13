import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import axios from 'axios';
import SockJS from 'sockjs-client';
import TrackDriverLocation from '../components/TrackDriverLocation';



// ---------------------------------------------------------------------------
// Status pipeline — mirrors OrderStatuses.java's allowed-transition graph:
//
//   PENDING -> CONFIRMED -> (SCHEDULED ->) PREPARING -> READY -> ASSIGNED
//     -> OUT_FOR_DELIVERY -> DELIVERED
//
// SCHEDULED is a conditional branch off CONFIRMED (only scheduled orders pass
// through it), so it's inserted into the displayed pipeline only when the
// order is actually a scheduled one. CANCELLED is a terminal state reachable
// from PENDING/CONFIRMED/SCHEDULED/PREPARING, so it's handled as its own
// banner rather than as a step in the linear progress list.
// ---------------------------------------------------------------------------

const BASE_STEPS = [
  {
    key: 'PENDING',
    label: 'Order received',
    detail: 'We\'ve received your order and are confirming it.',
  },
  {
    key: 'CONFIRMED',
    label: 'Order confirmed',
    detail: 'Your order has been confirmed and sent to the kitchen.',
  },
  {
    key: 'SCHEDULED',
    label: 'Scheduled',
    detail: 'Your order is scheduled — we\'ll start preparing it closer to your delivery time.',
  },
  {
    key: 'PREPARING',
    label: 'Preparing',
    detail: 'The kitchen is cooking your order fresh.',
  },
  {
    key: 'READY',
    label: 'Ready',
    detail: 'Your order is packed and waiting for a driver to pick it up.',
  },
  {
    key: 'ASSIGNED',
    label: 'Driver assigned',
    detail: 'A driver has been assigned to deliver your order.',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for delivery',
    detail: 'Your driver has picked up the order and is on the way.',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    detail: 'Enjoy your meal!',
  },
];

const useOrderTrackingSocket = (orderId, initialStatus) => {
  const [liveState, setLiveState] = useState({
    status: initialStatus,
    connected: false,
    updatedAt: null,
  });

  useEffect(() => {
  if (initialStatus) {
    setLiveState((prev) => ({
      ...prev,
      status: initialStatus,
    }));
  }
}, [initialStatus]);



  useEffect(() => {
    console.log(
      `%c[ORDER TRACKING WS] Starting WebSocket setup for Order #${orderId}`,
      'color: blue; font-weight: bold;'
    );

    let stompClient;

    const connectWebSocket = async () => {
      console.log(
        `[ORDER TRACKING WS] Getting JWT token for Order #${orderId}...`
      );

      const token = localStorage.getItem('jwtToken');

      if (!token) {
        console.error(
          `[ORDER TRACKING WS] ❌ NO JWT TOKEN FOUND for Order #${orderId}`
        );
        return;
      }

      console.log(
        `[ORDER TRACKING WS] ✅ JWT token found for Order #${orderId}`
      );

      console.log(
        `[ORDER TRACKING WS] Creating SockJS connection to /ws for Order #${orderId}...`
      );

      const socket = new SockJS(
        "http://localhost:8087/ws",
        null,
        {
          withCredentials: true
        }
      );

      console.log(
        `[ORDER TRACKING WS] ✅ SockJS object created for Order #${orderId}`
      );

      const { Client } = await import("@stomp/stompjs");

      console.log(
        `[ORDER TRACKING WS] ✅ STOMP Client loaded for Order #${orderId}`
      );

      stompClient = new Client({
        webSocketFactory: () => socket,

        connectHeaders: {
          Authorization: `Bearer ${token}`
        },

        reconnectDelay: 5000,

        debug: (str) => {
          console.log(
            `%c[ORDER TRACKING STOMP] Order #${orderId}: ${str}`,
            'color: gray;'
          );
        },

        onConnect: (frame) => {
          console.log(
            `%c[ORDER TRACKING WS] 🟢 CONNECTED successfully for Order #${orderId}`,
            'color: green; font-weight: bold;'
          );

          console.log(
            `[ORDER TRACKING WS] Subscribing to /topic/orders/${orderId}`
          );

          stompClient.subscribe(
            `/topic/orders/${orderId}`,
            (message) => {
              console.log(
                `%c[ORDER TRACKING WS] 📨 MESSAGE RECEIVED for Order #${orderId}`,
                'color: purple; font-weight: bold;'
              );

              console.log(
                `[ORDER TRACKING WS] Raw message body:`,
                message.body
              );

              try {
                const data = JSON.parse(message.body);

                console.log(
                  `%c[ORDER TRACKING WS] ✅ MESSAGE PARSED for Order #${orderId}`,
                  'color: green; font-weight: bold;'
                );

                console.log(
                  `[ORDER TRACKING WS] Parsed data:`,
                  data
                );

                console.log(
                  `[ORDER TRACKING WS] Received status:`,
                  data.status
                );

                console.log(
                  `[ORDER TRACKING WS] Received timestamp:`,
                  data.timestamp
                );

                setLiveState((prev) => ({
                  ...prev,
                  status: data.status,
                  connected: true,
                  updatedAt: data.timestamp,
                }));

                console.log(
                  `%c[ORDER TRACKING WS] 🎯 liveState updated for Order #${orderId}`,
                  'color: green; font-weight: bold;'
                );

              } catch (error) {
                console.error(
                  `[ORDER TRACKING WS] ❌ Failed to parse message for Order #${orderId}`,
                  error
                );
              }
            }
          );

          console.log(
            `%c[ORDER TRACKING WS] ✅ SUBSCRIBED to /topic/orders/${orderId}`,
            'color: green; font-weight: bold;'
          );

          setLiveState((prev) => ({
            ...prev,
            connected: true
          }));
        },

        onStompError: (frame) => {
          console.error(
            `%c[ORDER TRACKING WS] ❌ STOMP ERROR for Order #${orderId}`,
            'color: red; font-weight: bold;'
          );

          console.error(
            `[ORDER TRACKING WS] Error message:`,
            frame.headers["message"]
          );

          console.error(
            `[ORDER TRACKING WS] Error body:`,
            frame.body
          );

          setLiveState((prev) => ({
            ...prev,
            connected: false
          }));
        },

        onWebSocketError: (error) => {
          console.error(
            `%c[ORDER TRACKING WS] ❌ WEBSOCKET ERROR for Order #${orderId}`,
            'color: red; font-weight: bold;'
          );

          console.error(
            `[ORDER TRACKING WS] WebSocket error:`,
            error
          );
        },

        onWebSocketClose: (event) => {
          console.warn(
            `%c[ORDER TRACKING WS] 🟡 CONNECTION CLOSED for Order #${orderId}`,
            'color: orange; font-weight: bold;'
          );

          console.warn(
            `[ORDER TRACKING WS] Close event:`,
            event
          );

          setLiveState((prev) => ({
            ...prev,
            connected: false
          }));
        },
      });

      console.log(
        `[ORDER TRACKING WS] Activating STOMP client for Order #${orderId}...`
      );

      stompClient.activate();
    };

    connectWebSocket();

    return () => {
      console.log(
        `%c[ORDER TRACKING WS] 🔴 Cleaning up WebSocket for Order #${orderId}`,
        'color: red; font-weight: bold;'
      );

      if (stompClient) {
        stompClient.deactivate();

        console.log(
          `[ORDER TRACKING WS] WebSocket deactivated for Order #${orderId}`
        );
      }
    };

  }, [orderId]);

  return liveState;
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
  </svg>
);

const IconCheckCircle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

const IconChefHat = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12.5V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12.7a3.4 3.4 0 0 1-1.5-6.4 3.4 3.4 0 0 1 3-3 3.4 3.4 0 0 1 6.9-.6 3.4 3.4 0 0 1 3.1 3.6 3.4 3.4 0 0 1-1.5 6.4" />
  </svg>
);

const IconPackage = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.5 12 4 3 8.5v7L12 20l9-4.5v-7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5 12 13l9-4.5M12 13v7" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);

const IconTruck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </svg>
);

const IconHome = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 11 8-7 8 7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v10h12V10" />
  </svg>
);

const IconMapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12M18 6 6 18" />
  </svg>
);

const STEP_ICONS = {
  PENDING: IconClock,
  CONFIRMED: IconCheckCircle,
  SCHEDULED: IconClock,
  PREPARING: IconChefHat,
  READY: IconPackage,
  ASSIGNED: IconUser,
  OUT_FOR_DELIVERY: IconTruck,
  DELIVERED: IconHome,
};

const OrderTrackingPage = () => {
    const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem('jwtToken');
  const [order, setOrder] = useState([]);
  const param = useParams();
  const orderId = param.id;
  const live = useOrderTrackingSocket(orderId, order.order_status);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

  // Scheduled orders take the CONFIRMED -> SCHEDULED -> PREPARING branch, so
  // only show the "Scheduled" step for orders that actually went that route.
  const isScheduledOrder = Boolean(order?.scheduledDeliveredTime) || live.status === 'SCHEDULED';

  const STATUS_STEPS = useMemo(
    () => BASE_STEPS.filter((step) => step.key !== 'SCHEDULED' || isScheduledOrder),
    [isScheduledOrder]
  );

  const isCancelled = live.status === 'CANCELLED';

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === live.status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;


  const getOrderDetails = async () => {
    try {
        const [orderResponse, deliveryResponse] = await Promise.all([
            axios.get(`${API_URL}/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }),

            axios.get(`${API_URL}/delivery/order/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
        ]);

        console.log("ORDER:", orderResponse.data);
        console.log("DELIVERY:", deliveryResponse.data);

        setOrder({
            ...orderResponse.data,
            delivery: deliveryResponse.data
        });

    } catch (error) {
        console.error("Error", error);

        if (
            error.response?.data === "Too many requests" ||
            error.response?.status === 429
        ) {
            const retryAfter =
                parseInt(error.response.headers["retry-after"], 10) || 5;

            setRetryTime(retryAfter);
            setError("Too Many Requests");
            setShowRateLimitPopup(true);
        }
    }
};

useEffect(() => {
    getOrderDetails();
}, [orderId]);


      console.log("Order: ", order);
  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#26201B]">
        <Header />

      <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#A65A34]">
              Order status
            </p>
            <h1 className="text-[26px] font-semibold tracking-tight text-[#26201B]">
              Order #{order.orderId}
            </h1>
            <p className="mt-1.5 text-sm text-[#26201B]/55">
              Estimated arrival <span className="font-medium text-[#26201B]/80">{order.eta}</span>
            </p>
          </div>

          {/* Live connection indicator */}
          <div
            className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: live.connected ? 'rgba(63,146,104,0.25)' : 'rgba(38,32,27,0.12)',
              backgroundColor: live.connected ? '#E4F3EB' : '#FFFFFF',
              color: live.connected ? '#2F6B4F' : '#26201B99',
            }}
          >
            <span className="relative flex h-2 w-2">
              {live.connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3F9268] opacity-60" />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: live.connected ? '#3F9268' : '#26201B4D' }}
              />
            </span>
            {live.connected ? 'Live' : 'Connecting…'}
          </div>
        </div>

        {/*
          Live driver tracking — renders only when relevant (OUT_FOR_DELIVERY
          shows the live card, DELIVERED shows a settled confirmation,
          anything earlier or CANCELLED renders nothing). Destination
          coordinates aren't in the order/delivery response yet, so
          destination_lat/Lng are left undefined here; once the backend adds
          them, pass them through and distance/ETA will appear automatically.
        */}
        {!isCancelled && (
          <div className="mb-6">
            <TrackDriverLocation
              driverId={order?.delivery?.deliveryMen?.userId}
              orderStatus={live.status}
              destination_lat={order?.destination_lat}
              destination_lang={order?.destination_lang}
            />
          </div>
        )}

        {/* Status timeline / cancelled banner */}
        {isCancelled ? (
          <div className="flex items-start gap-4 rounded-2xl border border-[#C4392E]/20 bg-[#F7E9E6] p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C4392E]/12 text-[#B23A2E]">
              <IconX className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-[#8C3B2E]">Order cancelled</p>
              <p className="mt-1 text-sm leading-relaxed text-[#8C3B2E]/80">
                This order has been cancelled. If this wasn't expected, reach out to support and we'll help sort it out.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#26201B]/8 bg-white p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
            <ol className="relative">
              {STATUS_STEPS.map((step, index) => {
                const Icon = STEP_ICONS[step.key];
                const isComplete = index < activeIndex;
                const isCurrent = index === activeIndex;
                const isLast = index === STATUS_STEPS.length - 1;

                const circleBg = isComplete || isCurrent ? '#A65A34' : '#F5F3EF';
                const circleColor = isComplete || isCurrent ? '#FFFFFF' : '#26201B4D';
                const lineColor = isComplete ? '#A65A34' : 'rgba(38,32,27,0.1)';

                return (
                  <li key={step.key} className="relative pb-9 pl-14 last:pb-0">
                    {!isLast && (
                      <span
                        className="absolute left-[19px] top-10 h-full w-[2px] -translate-x-1/2 transition-colors"
                        style={{ backgroundColor: lineColor }}
                      />
                    )}

                    <span
                      className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                      style={{
                        backgroundColor: circleBg,
                        color: circleColor,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(166,90,52,0.14)' : 'none',
                      }}
                    >
                      {isComplete ? <IconCheck className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
                    </span>

                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className="text-[15px] font-semibold tracking-tight"
                        style={{ color: isComplete || isCurrent ? '#26201B' : '#26201B66' }}
                      >
                        {step.label}
                      </p>
                    </div>

                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: isComplete || isCurrent ? '#26201B99' : '#26201B4D' }}
                    >
                      {step.detail}
                    </p>

                    {isCurrent && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#EFE7DD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#A65A34]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A65A34]" />
                        In progress
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Order details */}
        <div className="mt-6 rounded-2xl border border-[#26201B]/8 bg-white p-6 shadow-[0_1px_2px_rgba(38,32,27,0.04)] sm:p-8">
          <h2 className="text-base font-semibold tracking-tight text-[#26201B]">Order details</h2>

          <div className="mt-4 flex items-start gap-1.5 text-sm text-[#26201B]/60">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#26201B]/30" />
            <span>{order.order_address}</span>
          </div>

          {!isCancelled && activeIndex >= STATUS_STEPS.findIndex((s) => s.key === 'ASSIGNED') && order?.delivery?.deliveryMen?.username && (
            <p className="mt-2 text-sm text-[#26201B]/60">
              <span className="text-[#26201B]/40">Driver — </span>
              <span className="font-medium text-[#26201B]">{order?.delivery?.deliveryMen?.username}</span>
            </p>
          )}

          <div className="my-5 h-px bg-[#26201B]/8" />

          <div className="space-y-2">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-[#26201B]/70">{item.quantity}×</span>
                <span className="font-medium text-[#26201B]">{item.catalog ? item.catalog.catalogName : item.combo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;