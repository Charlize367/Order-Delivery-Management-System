import React, { useState, useEffect, useMemo } from 'react';
import KitchenHeader from './KitchenHeader';
import axios from 'axios';
import RateLimitPopup from '../components/RateLimitPopup.jsx'; // adjust path if needed

// ---------------------------------------------------------------------------
// Kitchen Display System (KDS)
// (comment block unchanged — trimmed here for brevity)
// ---------------------------------------------------------------------------

const COLUMNS = [
  { key: 'CONFIRMED', label: 'New', accent: '#A65A34', accentSoft: '#A65A3414', actionLabel: 'Start Preparing' },
  { key: 'PREPARING', label: 'Preparing', accent: '#C08A2E', accentSoft: '#C08A2E14', actionLabel: 'Mark Ready' },
  { key: 'READY', label: 'Ready', accent: '#3F9268', accentSoft: '#3F926814', actionLabel: '' },
];

const pad2 = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Small inline icons (no external icon lib dependency)
// ---------------------------------------------------------------------------

const IconClock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3.5 2" />
  </svg>
);

const IconMapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

const IconUser = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="12" cy="8" r="3.2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [now, setNow] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [resourceId, setResourceId] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const getQueuedOrders = async () => {
  try {
    const [queuedRes, readyRes] = await Promise.all([
      axios.get(`${API_URL}/kitchen`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }),
      axios.get(`${API_URL}/kitchen/ready`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    ]);
    const queued = queuedRes.data.content ?? queuedRes.data;
    const ready = readyRes.data.content ?? readyRes.data;
    setOrders([...queued, ...ready]);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching kitchen orders", error);
    setIsLoading(false);
    if (error.response?.data === "Too many requests" || error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
      setRetryTime(retryAfter);
      setError("Too Many Requests");
      setShowRateLimitPopup(true);
    }
  }
};

useEffect(() => {
  getQueuedOrders();
  const poll = setInterval(getQueuedOrders, 10000);
  return () => clearInterval(poll);
}, []);

  
  const startPreparing = async(id) => {
    try {
        await axios.patch(`${API_URL}/kitchen/preparing/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });


        getQueuedOrders();
      } catch (err) {
        console.error('Failed to start preparing', err);
         setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
      }
  }


   const markReady = async(id) => {
    try {
        await axios.patch(`${API_URL}/kitchen/ready/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        getQueuedOrders();
      } catch (err) {
        console.error('Failed to mark as ready', err);
         setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
      }
  }

  const handleCancelConfirm = (id) => {
    setResourceId(id);
    setShowCancelPopup(true);
    
  }

  const cancelOrder = async(e) => {
    e.preventDefault();
    try {
        await axios.patch(`${API_URL}/kitchen/cancel/${resourceId}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setShowCancelPopup(false);
        getQueuedOrders();
      } catch (err) {
        console.error('Failed to mark as cancelled', err);
         setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
      }
  }

  const columns = useMemo(() => {
    return COLUMNS.map((col) => {
      const items = orders
        .filter((o) => o?.order_status === col.key)
        .sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
      return { ...col, items };
    });
  }, [orders]);

  const elapsed = (dateStr) => {
    const totalSec = Math.max(0, Math.floor((now - new Date(dateStr).getTime()) / 1000));
    return { m: Math.floor(totalSec / 60), s: totalSec % 60, totalSec };
  };

  const urgency = (totalSec) => {
    if (totalSec >= 20 * 60) return { accent: '#A65A34', soft: '#A65A3414', text: '#8A4A2A' };
    if (totalSec >= 10 * 60) return { accent: '#C08A2E', soft: '#C08A2E14', text: '#946200' };
    return { accent: '#3F9268', soft: '#3F926814', text: '#2F6B4F' };
  };

  const totalActive = orders.length;

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#26201B]">
      <KitchenHeader />

      {showRateLimitPopup && (
        <RateLimitPopup
          error={error}
          retryTime={retryTime}
          setRetryTime={setRetryTime}
          setShowPopup={setShowRateLimitPopup}
          showPopup={showRateLimitPopup}
          fetchData={getQueuedOrders}
        />
      )}

      <div className="border-b border-[#26201B]/8 bg-white/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#A65A34]">
              Kitchen
            </p>
            <div className="flex items-baseline gap-3">
              <h1 className="text-[26px] font-semibold tracking-tight text-[#26201B]">Order Queue</h1>
              <span className="text-sm text-[#26201B]/45">{totalActive} in queue</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#26201B]/10 bg-white px-3.5 py-1.5 text-sm font-medium text-[#26201B]/60 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3F9268] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3F9268]" />
            </span>
            Live
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center my-24">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#26201B]/10 border-t-[#A65A34]" />
        </div>
      ) : totalActive === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-28 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#26201B]/8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7 text-[#3F9268]">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4 10-10" />
            </svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-[#26201B]">All caught up</p>
          <p className="text-sm text-[#26201B]/50">No orders in the queue right now.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-[1600px] grid grid-cols-1 gap-6 p-6 md:grid-cols-3 md:p-8">
          {columns.map((col) => (
            <div key={col.key} className="flex min-h-[70vh] flex-col rounded-2xl bg-white/60 ring-1 ring-[#26201B]/8">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.accent }} />
                  <span className="text-base font-semibold tracking-tight text-[#26201B]">
                    {col.label}
                  </span>
                </div>
                <span
                  className="flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold"
                  style={{ backgroundColor: col.accentSoft, color: col.accent }}
                >
                  {col.items.length}
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
                {col.items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#26201B]/12 py-10 text-center text-sm text-[#26201B]/35">
                    Nothing here
                  </div>
                )}

                {col.items.map((or) => {
                  const { m, s, totalSec } = elapsed(or.order_date);
                  const u = urgency(totalSec);

                  return (
                    <div
                      key={or.orderId}
                      className="overflow-hidden rounded-2xl border border-[#26201B]/8 bg-white shadow-[0_1px_2px_rgba(38,32,27,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(38,32,27,0.08)]"
                    >
                      <div className="flex items-center justify-between px-5 pt-4">
                        <span className="text-base font-semibold tracking-tight text-[#26201B]">
                          Order #{or.orderId}
                        </span>
                        <span
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums"
                          style={{ backgroundColor: u.soft, color: u.text }}
                        >
                          <IconClock className="h-3.5 w-3.5" />
                          {m}:{pad2(s)}
                        </span>
                      </div>

                      <div className="mx-5 my-3 h-px bg-[#26201B]/8" />

                      <div className="space-y-2.5 px-5 pb-1">
                        {(or.orderItems || []).map((oi) => {
                          const isCombo = !!oi.combo;
                          const name = isCombo ? oi.combo.name : oi.catalog?.catalogName;
                          const itemKey = isCombo ? `c-${oi.combo.comboId}` : `i-${oi.catalog?.catalogId}`;
                          return (
                            <div key={itemKey}>
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-semibold text-[#26201B]/70">{oi.quantity}×</span>
                                <span className="text-base font-medium leading-snug text-[#26201B]">{name}</span>
                              </div>
                              {oi.modifierOptions && oi.modifierOptions.length > 0 && (
                                <p className="ml-6 text-sm text-[#26201B]/50">
                                  {oi.modifierOptions.map((m) => m.name).join(', ')}
                                </p>
                              )}
                              {oi.specialInstructions && (
                                <p className="ml-6 text-sm italic text-[#A65A34]">{oi.specialInstructions}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {(or.customer || or.order_address) && (
                        <div className="mt-3 space-y-1 px-5 pb-1">
                          {or.customer && (
                            <div className="flex items-center gap-1.5 text-xs text-[#26201B]/45">
                              <IconUser className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{or.customer.username}</span>
                            </div>
                          )}
                          {or.order_address && (
                            <div className="flex items-start gap-1.5 text-xs text-[#26201B]/45">
                              <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{or.order_address}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {col.key != 'READY' && (
                        <div className="mt-4 flex gap-2 p-4 pt-0">
                          <button
                            onClick={() => {
                              if (col.key === 'CONFIRMED') startPreparing(or.orderId);
                              else if (col.key === 'PREPARING') markReady(or.orderId);
                            }}
                            className="flex-1 cursor-pointer rounded-xl py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:brightness-95 active:brightness-90"
                            style={{ backgroundColor: '#26201B' }}
                          >
                            {col.actionLabel}
                          </button>
                          <button
                            onClick={() => handleCancelConfirm(or.orderId)}
                            className="cursor-pointer rounded-xl border border-[#26201B]/10 px-4 py-3 text-sm font-medium text-[#26201B]/50 transition-colors hover:border-[#A65A34]/30 hover:text-[#A65A34]"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}


      {showCancelPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26201B]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white px-7 py-7 text-[#26201B] text-center shadow-[0_20px_60px_rgba(38,32,27,0.25)]">
            
            <h2 className="text-lg font-semibold tracking-tight mb-2">Confirm Order Cancellation</h2>
            <p className="text-sm text-[#26201B]/55 mb-6">
              Are you sure you want to cancel this order?
            </p>

            <div className="space-y-3">
              <button
                onClick={cancelOrder}
                className="w-full cursor-pointer rounded-xl bg-[#26201B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A65A34]"
              >
                Yes, Cancel
              </button>

              <button
                onClick={() => {
                
                  setShowCancelPopup(false);
                  
                }}
                className="w-full cursor-pointer rounded-xl border border-[#26201B]/15 py-2.5 text-sm font-medium text-[#26201B]/70 transition-colors hover:bg-[#F5F3EF]"
              >
                Back
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;