import React, { useState, useEffect } from 'react';
import DispatcherHeader from './DispatcherHeader';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Mock data — replace with API data once the backend is connected
// ---------------------------------------------------------------------------

const MOCK_READY_ORDERS = [
  {
    orderId: 1038,
    address: '10 Shaw Blvd, Mandaluyong City',
    items: [
      { quantity: 2, name: 'Americano' },
      { quantity: 1, name: 'Cafe Latte' },
    ],
    specialInstructions: 'No onions',
  },
  {
    orderId: 1041,
    address: '25 Wilson St, San Juan City',
    items: [
      { quantity: 1, name: 'Iced Mocha' },
      { quantity: 3, name: 'Blueberry Muffin' },
    ],
    specialInstructions: '',
  },
  {
    orderId: 1044,
    address: '17 Kalayaan Ave, Quezon City',
    items: [
      { quantity: 1, name: 'Chicken Sandwich' },
      { quantity: 1, name: 'Iced Tea' },
      { quantity: 2, name: 'Chocolate Chip Cookie' },
    ],
    specialInstructions: 'Leave at the guard house',
  },
];

const MOCK_DRIVERS = [
  { driverId: 1, name: 'Juan Dela Cruz' },
  { driverId: 2, name: 'Mark Santos' },
  { driverId: 3, name: 'Alex Reyes' },
];

const MOCK_ACTIVE_DELIVERIES = [
  {
    orderId: 1038,
    driverName: 'Juan Dela Cruz',
    address: '10 Shaw Blvd, Mandaluyong City',
    status: 'ASSIGNED',
  },
  {
    orderId: 1035,
    driverName: 'Mark Santos',
    address: '88 Wack-Wack Rd, Mandaluyong City',
    status: 'OUT FOR DELIVERY',
  },
];

const STATUS_STYLES = {
  ASSIGNED: { text: '#946200', bg: '#FDF3DC', dot: '#E3A712' },
  'OUT FOR DELIVERY': { text: '#2F6B4F', bg: '#E4F3EB', dot: '#3F9268' },
};

// ---------------------------------------------------------------------------
// Small inline icons (no external icon lib dependency)
// ---------------------------------------------------------------------------

const IconPackage = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.5 12 4 3 8.5v7L12 20l9-4.5v-7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5 12 13l9-4.5M12 13v7" />
  </svg>
);

const IconTruck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
    <circle cx="7.5" cy="17.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </svg>
);

const IconUsers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="9" cy="8" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 20a5.5 5.5 0 0 1 11 0M16 8.5a2.5 2.5 0 1 1 0 5M19.5 20a4.5 4.5 0 0 0-4-4.46" />
  </svg>
);

const IconMapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

const IconRefresh = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 11A8 8 0 0 0 6.3 6.3L4 8.6M4 13a8 8 0 0 0 13.7 4.7L20 15.4M4 4v4.6h4.6M15.4 20v-4.6H20" />
  </svg>
);

// ---------------------------------------------------------------------------

const DispatcherDashboard = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [isLoading, setIsLoading] = useState(true);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // -------------------------------------------------------------------------
  // Placeholder functions — connect these to your backend
  // -------------------------------------------------------------------------

  const handleRefreshOrders = async() => {
    // TODO: fetch latest ready-to-assign orders + active deliveries from backend
    try {
      
        const response = await axios.get(`${API_URL}/dispatcher/orders/ready`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        setReadyOrders(response.data.content);
      
    
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dispatcher data", error);
      setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
    console.log('handleRefreshOrders called — connect to backend');
  };


  console.log("Ready orders: ", readyOrders);

  const getActiveDeliveries = async() => {
    // TODO: fetch latest ready-to-assign orders + active deliveries from backend
    try {
      
        const response = await axios.get(`${API_URL}/dispatcher/deliveries/active`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        setActiveDeliveries(response.data);
  
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching active deliveries", error);
      setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
    console.log('getActiveDeliveries called — connect to backend');
  };


  console.log("Active deliveries", activeDeliveries)

  useEffect(() => {
    handleRefreshOrders();
    const poll = setInterval(handleRefreshOrders, 10000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    getActiveDeliveries();
    const poll = setInterval(getActiveDeliveries, 10000);
    return () => clearInterval(poll);
  }, []);
  

  const getAvailableDrivers = async() => {
    // TODO: fetch latest ready-to-assign orders + active deliveries from backend
    try {
      
        const response = await axios.get(`${API_URL}/dispatcher/drivers/available`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        setDrivers(response.data);
  
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching drivers", error);
      setIsLoading(false);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
    console.log('getAvailableDrivers called — connect to backend');
  };

  useEffect(() => {
    getAvailableDrivers();
   
  }, []);

  console.log("Available drivers: ", drivers)


  const handleAssignDriver = async(orderId, driverId) => {
    event.preventDefault();

            try {

                const response = await axios.post(`${API_URL}/dispatcher/orders/${orderId}/assign`, null, {
                  params: {
                    driverId: driverId,
                 
                  },
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            
                getActiveDeliveries();
                 event.target.reset();
                showAssignModal(false);

              
             
                return true;

            } catch (error) {
                console.error('Failed to assign driver:', error);
                if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);

            }
                return false;

            }
    console.log('handleAssignDriver called', { orderId, driverId });
  };

  // -------------------------------------------------------------------------
  // Modal helpers (local UI state only)
  // -------------------------------------------------------------------------

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedDriverId(null);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedOrder(null);
    setSelectedDriverId(null);
  };

  const confirmAssignDriver = () => {
    if (!selectedOrder || !selectedDriverId) return;
    handleAssignDriver(selectedOrder.orderId, selectedDriverId);
    closeAssignModal();
  };

  const summary = {
    readyToAssign: readyOrders.length,
    activeDeliveries: activeDeliveries.length,
    availableDrivers: drivers.length,
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#26201B]">
      <DispatcherHeader />

      {/* Header */}
      <div className="border-b border-[#26201B]/8 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-8">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#A65A34]">
              Operations
            </p>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#26201B]">Dispatcher</h1>
            <p className="mt-1.5 text-sm text-[#26201B]/55">
              Manage delivery assignments and monitor active deliveries.
            </p>
          </div>
          <button
            onClick={handleRefreshOrders}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#26201B]/12 bg-white px-5 py-2.5 text-sm font-medium text-[#26201B]/80 shadow-sm transition-all hover:border-[#A65A34]/30 hover:text-[#A65A34] hover:shadow-md"
          >
            <IconRefresh className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        {/* Summary Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<IconPackage className="h-5 w-5" />}
            label="Ready to Assign"
            value={summary.readyToAssign}
            tint="#A65A34"
          />
          <SummaryCard
            icon={<IconTruck className="h-5 w-5" />}
            label="Active Deliveries"
            value={summary.activeDeliveries}
            tint="#C08A2E"
          />
          <SummaryCard
            icon={<IconUsers className="h-5 w-5" />}
            label="Available Drivers"
            value={summary.availableDrivers}
            tint="#3F9268"
          />
        </div>

        {/* Ready to Assign */}
        <section className="mb-12">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-[#26201B]">Ready to Assign</h2>
            <span className="text-sm text-[#26201B]/45">{readyOrders.length} orders</span>
          </div>

          {readyOrders.length === 0 ? (
            <EmptyState text="No orders ready for assignment." />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {readyOrders?.map((order) => (
                <div
                  key={order.orderId}
                  className="group flex flex-col rounded-2xl border border-[#26201B]/8 bg-white p-5 shadow-[0_1px_2px_rgba(38,32,27,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(38,32,27,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tracking-tight text-[#26201B]">
                      Order #{order.orderId}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-[#EFE7DD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#A65A34]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#A65A34]" />
                      Ready
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-1.5 text-sm text-[#26201B]/55">
                    <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#26201B]/30" />
                    <span>{order.order_address}</span>
                  </div>

                  <div className="my-4 h-px bg-[#26201B]/8" />

                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#26201B]/35">
                      {order.orderItems.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                    </p>
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-baseline gap-2 text-sm">
                        <span className="font-semibold text-[#26201B]/70">{item.quantity}×</span>
                        <span className="font-medium text-[#26201B]">{item.catalog?.catalogName}</span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-4 rounded-lg bg-[#FBF6EC] px-3.5 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#26201B]/35">
                        Special instructions
                      </p>
                      <p className="mt-0.5 text-sm italic text-[#A65A34]">{order.order_notes}</p>
                    </div>
                  )}

                  <button
                    onClick={() => openAssignModal(order)}
                    className="mt-5 w-full cursor-pointer rounded-xl bg-[#26201B] py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#A65A34]"
                  >
                    Assign Driver
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Deliveries */}
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-[#26201B]">Active Deliveries</h2>
            <span className="text-sm text-[#26201B]/45">{activeDeliveries.length} in progress</span>
          </div>

          {activeDeliveries.length === 0 ? (
            <EmptyState text="No active deliveries right now." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeDeliveries.map((delivery) => {
                const s = STATUS_STYLES[delivery.status] || STATUS_STYLES.ASSIGNED;
                return (
                  <div
                    key={delivery.deliveryId}
                    className="rounded-2xl border border-[#26201B]/8 bg-white p-5 shadow-[0_1px_2px_rgba(38,32,27,0.04)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold tracking-tight text-[#26201B]">
                        #{delivery.deliveryId}
                      </span>
                      <span
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: s.bg, color: s.text }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                        {delivery.order?.order_status}
                      </span>
                    </div>
                    <p className="mt-3.5 text-sm text-[#26201B]/70">
                      <span className="text-[#26201B]/40">Driver — </span>
                      <span className="font-medium">{delivery.deliveryMen?.username}</span>
                    </p>
                    <div className="mt-1.5 flex items-start gap-1.5 text-sm text-[#26201B]/55">
                      <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#26201B]/30" />
                      <span>{delivery.address}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26201B]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-[0_20px_60px_rgba(38,32,27,0.25)]">
            <h2 className="text-lg font-semibold tracking-tight text-[#26201B]">Assign Driver</h2>

            <div className="mt-4 rounded-xl bg-[#F5F3EF] px-4 py-3.5">
              <p className="text-sm font-semibold text-[#26201B]">Order #{selectedOrder.orderId}</p>
              <div className="mt-1 flex items-start gap-1.5 text-sm text-[#26201B]/55">
                <IconMapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#26201B]/30" />
                <span>{selectedOrder.order_address}</span>
              </div>
            </div>

            <p className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wide text-[#26201B]/35">
              Available Drivers
            </p>

            <div className="space-y-2">
              {drivers.map((driver) => {
                const isSelected = selectedDriverId === driver.userId;
                return (
                  <label
                    key={driver.driverId}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                    style={{
                      borderColor: isSelected ? '#26201B' : 'rgba(38,32,27,0.1)',
                      backgroundColor: isSelected ? '#26201B' : '#FFFFFF',
                    }}
                  >
                    <input
                      type="radio"
                      name="driver"
                      checked={isSelected}
                      onChange={() => setSelectedDriverId(driver.userId)}
                      className="h-4 w-4 accent-white"
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSelected ? '#FFFFFF' : '#26201B' }}
                    >
                      {driver.username}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeAssignModal}
                className="flex-1 cursor-pointer rounded-xl border border-[#26201B]/15 py-2.5 text-sm font-medium text-[#26201B]/70 transition-colors hover:bg-[#F5F3EF]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignDriver}
                disabled={!selectedDriverId}
                className="flex-1 cursor-pointer rounded-xl bg-[#26201B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A65A34] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, label, value, tint }) => (
  <div className="rounded-2xl border border-[#26201B]/8 bg-white p-5 shadow-[0_1px_2px_rgba(38,32,27,0.04)]">
    <div className="flex items-center justify-between">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tint}14`, color: tint }}
      >
        {icon}
      </span>
      <span className="text-3xl font-semibold tracking-tight text-[#26201B]">{value}</span>
    </div>
    <p className="mt-3 text-sm font-medium text-[#26201B]/55">{label}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-[#26201B]/12 bg-white/60 py-16 text-center text-sm text-[#26201B]/35">
    {text}
  </div>
);

export default DispatcherDashboard;