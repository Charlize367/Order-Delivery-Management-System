import React from 'react'
import Header from '../components/DeliveryHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';
import GetDriverLocation from '../components/DriverLocationExtractor.jsx';

// =============================================================================
// CONFIG
// Real endpoints confirmed:
//   PATCH /api/v1/delivery/otw/{orderId}       → transitions ASSIGNED → OUT_FOR_DELIVERY
//   PATCH /api/v1/delivery/delivered/{orderId} → transitions OUT_FOR_DELIVERY → DELIVERED
// No request body — the endpoint itself encodes the transition.
//
// Still unconfirmed (kept as noted assumptions, not blocking this mockup):
//   1. Field path: assuming `d.order.order_status` (matches OrderDetails.jsx's
//      `or.order.order_status`), not yet confirmed for the /delivery response shape.
//   2. Enum casing: assuming ASSIGNED / OUT_FOR_DELIVERY / DELIVERED / CANCELLED
//      (all-caps) per your spec. OrderDetails.jsx's cancelOrder sends 'Cancelled'
//      (Title Case) to a *different* endpoint (/orders/orderStatus), so that one
//      data point doesn't necessarily apply here — flagging in case it does.
// =============================================================================

const ORDER_STATUS = {
  ASSIGNED: 'ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

const markOnTheWayRequest = async (API_URL, token, orderId) =>
  axios.patch(
    `${API_URL}/delivery/otw/${orderId}`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

const markDeliveredRequest = async (API_URL, token, orderId, deliveryId) =>
  axios.patch(
    `${API_URL}/delivery/${deliveryId}/delivered/${orderId}`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const formatTimeStr = (value, fallback) => {
  if (!value) return fallback;
  const [hours, minutes, seconds] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
};

const formatDateStr = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Name for an order line, whether it's a catalog item or a combo. */
const itemName = (oi) => (oi.combo ? oi.combo.name : oi.catalog?.catalog_name);
const itemKey = (oi) => (oi.combo ? `combo-${oi.combo.comboId}` : `catalog-${oi.catalog.catalogId}`);

/** ⚠️ Placeholder accessor — confirm the real path to order status on the delivery object. */
const getOrderStatus = (d) => d.order?.order_status;

const PinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.1-7-11.2A7 7 0 0119 9.8C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------

function ItemsSummary({ items, tone = 'default' }) {
  const [open, setOpen] = useState(false);
  const textClass = tone === 'muted' ? 'text-[#8A7862]' : 'text-[#3B2A20]';

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm font-medium ${textClass} hover:text-[#A65A34] transition-colors`}
      >
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {items.length} item{items.length === 1 ? '' : 's'}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-5">
          {items.map((oi) => (
            <li key={itemKey(oi)} className="flex items-center justify-between gap-2 text-sm text-[#3B2A20]">
              <span className="truncate">{itemName(oi)}</span>
              <span className="shrink-0 text-[#8A7862]">×{oi.quantity}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditableField({ label, display, editing, onToggle, children }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#8A7862] mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          {children}
          <button type="button" onClick={onToggle} className="shrink-0 text-xs font-medium text-[#8A7862] hover:text-[#3B2A20] cursor-pointer">
            Done
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#3B2A20]">{display}</span>
          <button type="button" onClick={onToggle} className="text-xs font-medium text-[#A65A34] hover:text-[#8A4A2A] cursor-pointer">
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section cards — driven by order_status, not delivery_status
// ---------------------------------------------------------------------------

/** orderStatus === OUT_FOR_DELIVERY — the prominent, currently-being-handled delivery. */
function ActiveDeliveryCard({ d, onMarkDelivered, onETAChange, busy }) {
  const [editingETA, setEditingETA] = useState(false);
  const eta = formatTimeStr(d.estimated_time, 'Not set');

  return (
    <div className="bg-white border-2 border-[#A65A34]/30 rounded-2xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3.5 bg-[#A65A34] text-white">
        <span className="text-xs font-semibold uppercase tracking-wide">Active Delivery</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          On the Way
        </span>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Order #{d.order.orderId}</p>
            <p className="mt-0.5 text-sm text-[#8A7862]">{d.order.customer.username} · {formatDateStr(d.order.order_date)}</p>
          </div>
          <ItemsSummary items={d.orderItems} />
        </div>

        <div className="mt-6 flex items-start gap-2.5">
          <PinIcon className="h-5 w-5 text-[#A65A34] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#8A7862]">Deliver to</p>
            <p className="text-sm font-medium text-[#3B2A20] leading-relaxed">{d.address}</p>
          </div>
        </div>

        <div className="mt-5">
          <EditableField label="Estimated arrival" display={eta} editing={editingETA} onToggle={() => setEditingETA((v) => !v)}>
            <input
              type="time"
              autoFocus
              value={d.estimated_time ? d.estimated_time.substring(0, 5) : ''}
              onChange={(e) => onETAChange(d.deliveryId, e.target.value)}
              className="rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] px-2.5 py-1.5 text-sm text-[#3B2A20] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
            />
          </EditableField>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8A9A5B]/25 bg-[#8A9A5B]/10 px-3 py-1.5 text-xs font-medium text-[#5C6B3B]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8A9A5B] animate-pulse" />
          Live location active
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => onMarkDelivered(d)}
          className="mt-6 w-full rounded-lg bg-[#A65A34] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8A4A2A] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {busy ? 'Updating…' : 'Mark as Delivered'}
        </button>
      </div>
    </div>
  );
}

/** orderStatus === ASSIGNED — compact, ready for pickup/handoff. */
function AssignedDeliveryCard({ d, onMarkOnTheWay, onETAChange, busy }) {
  const eta = formatTimeStr(d.estimated_time, 'Not set');

  return (
    <div className="bg-white border border-[#E7DCC9] rounded-xl px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[#A65A34]/12 text-[#A65A34] border-[#A65A34]/20">
            Assigned
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#3B2A20] truncate">#{d.order.orderId} · {d.order.customer.username}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <PinIcon className="h-3.5 w-3.5 text-[#8A7862] shrink-0" />
              <p className="text-xs text-[#8A7862] truncate">{d.address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A7862]">ETA</p>
            <p className="text-sm font-semibold text-[#3B2A20]">{eta}</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onMarkOnTheWay(d)}
            className="rounded-lg bg-[#A65A34] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8A4A2A] disabled:opacity-50 cursor-pointer"
          >
            {busy ? 'Updating…' : 'Mark as On the Way'}
          </button>
        </div>
      </div>

      <div className="mt-2.5 pl-[4.5rem]">
        <ItemsSummary items={d.orderItems} tone="muted" />
      </div>

      <details className="mt-2 pl-[4.5rem]">
        <summary className="text-xs font-medium text-[#8A7862] hover:text-[#A65A34] cursor-pointer select-none">Edit ETA</summary>
        <input
          type="time"
          value={d.estimated_time ? d.estimated_time.substring(0, 5) : ''}
          onChange={(e) => onETAChange(d.deliveryId, e.target.value)}
          className="mt-1.5 rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] px-2.5 py-1.5 text-sm text-[#3B2A20] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
        />
      </details>
    </div>
  );
}

/** orderStatus === DELIVERED — quiet, read-only. */
function CompletedDeliveryCard({ d, onDeliveredChange }) {
  const delivered = formatTimeStr(d.delivered_time, 'Not recorded');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7DCC9] bg-[#FBF6EE]/50 px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[#8A9A5B]/15 text-[#5C6B3B] border-[#8A9A5B]/25">
          ✓ Delivered
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#6B5745] truncate">#{d.order.orderId} · {d.order.customer.username}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <PinIcon className="h-3.5 w-3.5 text-[#8A7862] shrink-0" />
            <p className="text-xs text-[#8A7862] truncate">{d.address}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A7862]">Delivered at</p>
          <p className="text-sm font-medium text-[#3B2A20]">{delivered}</p>
        </div>
        {/* ⚠️ Kept per spec: "if backend still requires driver to manually set delivered time".
           If DELIVERED already stamps delivered_time server-side, this can be removed. */}
        <details>
          <summary className="text-xs font-medium text-[#8A7862] hover:text-[#A65A34] cursor-pointer select-none list-none">Edit</summary>
          <input
            type="time"
            value={d.delivered_time ? d.delivered_time.substring(0, 5) : ''}
            onChange={(e) => onDeliveredChange(d.deliveryId, e.target.value)}
            className="mt-1.5 rounded-lg border border-[#E7DCC9] bg-white px-2.5 py-1.5 text-sm text-[#3B2A20] focus:outline-none focus:ring-2 focus:ring-[#A65A34]/30"
          />
        </details>
      </div>
    </div>
  );
}

/** orderStatus === CANCELLED — muted, no action. */
function CancelledDeliveryCard({ d }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7DCC9] bg-[#FBF6EE]/30 px-5 py-3.5 opacity-75">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[#3B2A20]/8 text-[#6B5745] border-[#3B2A20]/10">
          Cancelled
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#6B5745] truncate">#{d.order.orderId} · {d.order.customer.username}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <PinIcon className="h-3.5 w-3.5 text-[#8A7862] shrink-0" />
            <p className="text-xs text-[#8A7862] truncate">{d.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Any other order_status (PENDING/CONFIRMED/SCHEDULED/PREPARING/READY) — driver has no controls, just visibility. */
function UpcomingDeliveryCard({ d }) {
  const status = getOrderStatus(d);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E7DCC9] bg-white px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-[#FBF6EE] text-[#8A7862] border-[#E7DCC9]">
          {status || 'Unknown'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#3B2A20] truncate">#{d.order.orderId} · {d.order.customer.username}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <PinIcon className="h-3.5 w-3.5 text-[#8A7862] shrink-0" />
            <p className="text-xs text-[#8A7862] truncate">{d.address}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-[#8A7862] shrink-0">Not yet ready for pickup</p>
    </div>
  );
}

function SectionHeading({ children, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8A7862]">{children}</h2>
      {typeof count === 'number' && (
        <span className="text-xs font-medium text-[#8A7862] bg-[#E7DCC9]/50 rounded-full px-2 py-0.5">{count}</span>
      )}
    </div>
  );
}

function DeliveryCardSkeleton() {
  return (
    <div className="bg-white border border-[#E7DCC9] rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 bg-[#FBF6EE]/60 border-b border-[#E7DCC9] flex justify-between">
        <div className="h-4 w-40 bg-[#E7DCC9] rounded" />
        <div className="h-6 w-24 bg-[#E7DCC9] rounded-full" />
      </div>
      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-16 bg-[#FBF6EE] rounded-lg" />
        <div className="h-16 bg-[#FBF6EE] rounded-lg" />
        <div className="h-16 bg-[#FBF6EE] rounded-lg" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A65A34]/8">
        <svg className="h-8 w-8 text-[#A65A34]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">No deliveries found</p>
      <p className="mt-1 text-sm text-[#8A7862]">Deliveries assigned to you will show up here.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const DeliveriesList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');

  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState(null); // disables the clicked action button while its PUT is in flight

  const getDeliveryDetails = async (page = 0) => {
    try {
      const response = await axios.get(`${API_URL}/delivery?page=${page}&size=${pageSize}&driverId=${user_ID}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const deliveries = response.data.content;

      const deliveryWithOrderItems = await Promise.all(
        deliveries.map(async (delivery) => {
          const orderId = delivery.order.orderId;
          const itemsRes = await axios.get(`${API_URL}/orderItems/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          return { ...delivery, orderItems: itemsRes.data };
        })
      );

      setDeliveryDetails(deliveryWithOrderItems);
      setCurrentPage(response.data.number);
      setTotalPages(response.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  useEffect(() => {
    getDeliveryDetails(0);
  }, []);

  // Unchanged: existing ETA / delivered-time endpoints, untouched.
  const handleSubmit2 = async (deliveryId, deliveredTime) => {
    const putData = { delivered_time: deliveredTime };
    try {
      const response = await axios.put(`${API_URL}/delivery/deliveredTime/${deliveryId}`, putData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setDeliveryDetails((d) =>
        d.map((dd) => (dd.deliveryId === deliveryId ? { ...dd, delivered_time: response.data.delivered_time } : dd))
      );
      getDeliveryDetails(currentPage);
    } catch (error) {
      console.log('Failed to Update Time');
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  const handleSubmit3 = async (deliveryId, estimatedTime) => {
    const putData = { estimated_time: estimatedTime };
    try {
      const response = await axios.put(`${API_URL}/delivery/estimatedTime/${deliveryId}`, putData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setDeliveryDetails((d) =>
        d.map((dd) => (dd.deliveryId === deliveryId ? { ...dd, estimated_time: response.data.estimated_time } : dd))
      );
      getDeliveryDetails(currentPage);
    } catch (error) {
      console.log('Failed to Update Time');
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  // Optimistically patch d.order.order_status locally so the card re-buckets immediately,
  // then refetch to reconcile with whatever the backend actually persisted
  // (including delivered_time, if that endpoint stamps it server-side).
  const markOnTheWay = async (d) => {
    setBusyOrderId(d.order.orderId);
    try {
      await markOnTheWayRequest(API_URL, token, d.order.orderId);
      setDeliveryDetails((list) =>
        list.map((dd) =>
          dd.deliveryId === d.deliveryId
            ? { ...dd, order: { ...dd.order, order_status: ORDER_STATUS.OUT_FOR_DELIVERY } }
            : dd
        )
      );
      getDeliveryDetails(currentPage);
    } catch (error) {
      console.log('Failed to mark on the way', error);
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    } finally {
      setBusyOrderId(null);
    }
  };

  console.log(deliveryDetails);

  const markDelivered = async (d) => {
    setBusyOrderId(d.order.orderId);
    try {
      await markDeliveredRequest(API_URL, token, d.order.orderId, d.deliveryId);
      setDeliveryDetails((list) =>
        list.map((dd) =>
          dd.deliveryId === d.deliveryId ? { ...dd, order: { ...dd.order, order_status: ORDER_STATUS.DELIVERED } } : dd
        )
      );
      getDeliveryDetails(currentPage);
    } catch (error) {
      console.log('Failed to mark delivered', error);
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    } finally {
      setBusyOrderId(null);
    }
  };

  // Grouped by order_status, NOT delivery_status.
  const activeDeliveries = deliveryDetails.filter((d) => getOrderStatus(d) === ORDER_STATUS.OUT_FOR_DELIVERY);
  const assignedDeliveries = deliveryDetails.filter((d) => getOrderStatus(d) === ORDER_STATUS.ASSIGNED);
  const completedDeliveries = deliveryDetails.filter((d) => getOrderStatus(d) === ORDER_STATUS.DELIVERED);
  const cancelledDeliveries = deliveryDetails.filter((d) => getOrderStatus(d) === ORDER_STATUS.CANCELLED);
  const upcomingDeliveries = deliveryDetails.filter(
    (d) => ![ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.ASSIGNED, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(getOrderStatus(d))
  );

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header />
      <GetDriverLocation id={user_ID} />

      <div className="px-6 sm:px-10 py-9 max-w-4xl mx-auto">
        <h1 className="font-['Fraunces',serif] text-3xl sm:text-4xl font-semibold text-[#3B2A20]">My Deliveries</h1>
        <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]" />
        {!isLoading && deliveryDetails.length > 0 && (
          <p className="mt-5 text-sm text-[#8A7862]">
            This page: <span className="font-semibold text-[#3B2A20]">{activeDeliveries.length} Active</span>
            {' · '}
            <span className="font-semibold text-[#3B2A20]">{assignedDeliveries.length} Assigned</span>
            {' · '}
            <span className="font-semibold text-[#3B2A20]">{completedDeliveries.length} Completed</span>
          </p>
        )}
      </div>

      {showRateLimitPopup && (
        <RateLimitPopup
          error={error}
          retryTime={retryTime}
          setRetryTime={setRetryTime}
          setShowPopup={setShowRateLimitPopup}
          showPopup={showRateLimitPopup}
          fetchData={getDeliveryDetails}
          currentPage={currentPage}
        />
      )}

      <div className="px-4 sm:px-10 pb-16 max-w-4xl mx-auto space-y-10">
        {isLoading && (
          <div className="space-y-4">
            <DeliveryCardSkeleton />
            <DeliveryCardSkeleton />
          </div>
        )}

        {!isLoading && deliveryDetails.length === 0 && <EmptyState />}

        {!isLoading && activeDeliveries.length > 0 && (
          <section>
            <SectionHeading count={activeDeliveries.length}>Active Delivery</SectionHeading>
            <div className="space-y-4">
              {activeDeliveries.map((d) => (
                <ActiveDeliveryCard
                  key={d.deliveryId}
                  d={d}
                  onMarkDelivered={markDelivered}
                  onETAChange={handleSubmit3}
                  busy={busyOrderId === d.order.orderId}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && assignedDeliveries.length > 0 && (
          <section>
            <SectionHeading count={assignedDeliveries.length}>Assigned</SectionHeading>
            <div className="space-y-2.5">
              {assignedDeliveries.map((d) => (
                <AssignedDeliveryCard
                  key={d.deliveryId}
                  d={d}
                  onMarkOnTheWay={markOnTheWay}
                  onETAChange={handleSubmit3}
                  busy={busyOrderId === d.order.orderId}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && upcomingDeliveries.length > 0 && (
          <section>
            <SectionHeading count={upcomingDeliveries.length}>Upcoming</SectionHeading>
            <div className="space-y-2.5">
              {upcomingDeliveries.map((d) => (
                <UpcomingDeliveryCard key={d.deliveryId} d={d} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && completedDeliveries.length > 0 && (
          <section>
            <SectionHeading count={completedDeliveries.length}>Completed</SectionHeading>
            <div className="space-y-2">
              {completedDeliveries.map((d) => (
                <CompletedDeliveryCard key={d.deliveryId} d={d} onDeliveredChange={handleSubmit2} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && cancelledDeliveries.length > 0 && (
          <section>
            <SectionHeading count={cancelledDeliveries.length}>Cancelled</SectionHeading>
            <div className="space-y-2">
              {cancelledDeliveries.map((d) => (
                <CancelledDeliveryCard key={d.deliveryId} d={d} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && deliveryDetails.length > 0 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getDeliveryDetails} />
        )}
      </div>
    </div>
  );
};

export default DeliveriesList