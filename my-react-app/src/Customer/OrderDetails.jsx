import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

// ---------------------------------------------------------------------------
// Small presentational helpers (pure, no hooks) — kept in this file since
// OrderDetails was already a single-file page. They just take data + the
// callbacks/formatters the page already computes.
// ---------------------------------------------------------------------------

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (value) =>
  !value
    ? null
    : new Date(`1970-01-01T${value}Z`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

function Toast({ show, message }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[99] w-full max-w-xs" role="alert">
      <div className="flex items-center w-full p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg border border-[#E7DCC9]/20">
        <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#B7C68C] bg-[#8A9A5B]/20 rounded-lg">
          <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
        </div>
        <div className="ms-3 text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes =
    status === 'Cancelled'
      ? 'bg-[#3B2A20]/8 text-[#6B5745]'
      : status === 'Delivered' || status === 'On the Way'
      ? 'bg-[#8A9A5B]/15 text-[#5C6B3B]'
      : 'bg-[#A65A34]/12 text-[#A65A34]';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}

function OrderCard({ order: or, isOngoing, onTrack, onCancelClick, onReorder, getItemsSubtotal }) {
  const scheduled = or.scheduledDeliveredTime
    ? new Date(or.scheduledDeliveredTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      })
    : null;

  console.log(or);

  return (
    <div className="max-w-6xl mx-auto bg-white border border-[#E7DCC9] rounded-2xl shadow-sm overflow-hidden">
      {/* Card header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 sm:px-10 sm:py-6 border-b border-[#E7DCC9] bg-[#FBF6EE]/60">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8A7862]">Order #{or.order.orderId}</p>
            <p className="mt-0.5 text-sm font-medium text-[#3B2A20]">{formatDate(or.order.order_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOngoing && (
            <button
              onClick={() => onTrack(or.order.orderId)}
              className="flex items-center gap-1.5 cursor-pointer rounded-full border border-[#A65A34]/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#A65A34] transition hover:bg-[#A65A34]/10"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
                <circle cx="7.5" cy="17.5" r="1.5" />
                <circle cx="17.5" cy="17.5" r="1.5" />
              </svg>
              Track Order
            </button>
          )}
          <StatusBadge status={or.order.order_status} />
        </div>
      </div>

      <div className="px-6 py-6 sm:px-10 sm:py-8">
        {/* Quick facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-6 border-b border-[#E7DCC9]">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7862]">Payment</p>
            <p className="text-sm font-semibold text-[#3B2A20]">{or.order.payment_status}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7862]">Driver</p>
            <p className="text-sm font-semibold text-[#3B2A20]">{or.deliveryMen?.username || 'Not yet assigned'}</p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7862]">
              {scheduled ? 'Scheduled' : 'Estimated'}
            </p>
            <p className="text-sm font-semibold text-[#3B2A20]">
              {scheduled || formatTime(or.estimated_time) || 'Pending'}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#8A7862]">Address</p>
            <p className="text-sm font-semibold text-[#3B2A20] truncate" title={or.address}>{or.address}</p>
          </div>
        </div>

        {/* Items + summary */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-3">
            {or.orderItems.map((oi) => {
              const isCombo = !!oi.combo;
              return (
                <div
                  key={isCombo ? oi.combo.comboId : oi.catalog.catalogId}
                  className="flex items-center gap-4 bg-[#FBF6EE] border border-[#E7DCC9] p-4 rounded-xl"
                >
                  {!isCombo && (
                    <div className="w-20 h-20 shrink-0 bg-white p-1.5 rounded-lg border border-[#E7DCC9]">
                      <img
                        src={`https://${import.meta.env.VITE_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${oi.catalog.catalog_image}`}
                        alt={oi.catalog.catalogName}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-[#3B2A20] truncate">
                        {isCombo ? oi.combo.name : oi.catalog.catalogName}
                      </h3>
                      <span className="shrink-0 text-sm font-semibold text-[#A65A34]">PHP {oi.subtotal}</span>
                    </div>
                    <p className="text-xs text-[#8A7862] mt-0.5">Qty: {oi.quantity}</p>

                    {oi.modifierOptions?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {oi.modifierOptions.map((m) => (
                          <span
                            key={m.modifierOptionId}
                            className="inline-flex items-center rounded-full border border-[#E7DCC9] bg-white px-2 py-0.5 text-[11px] text-[#6B5745]"
                          >
                            {m.name}
                            {Number(m.priceAdjustment) > 0 && (
                              <span className="ml-1 text-[#A65A34]">+PHP {Number(m.priceAdjustment).toFixed(2)}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {oi.specialInstructions && (
                      <p className="mt-1.5 text-xs italic text-[#8A7862]">
                        <span className="font-medium not-italic text-[#6B5745]">Note: </span>
                        {oi.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="bg-[#FBF6EE] border border-[#E7DCC9] rounded-xl p-6">
              <h3 className="text-base font-semibold text-[#3B2A20] font-['Fraunces',serif]">Billing details</h3>
              <ul className="mt-4 text-sm text-[#6B5745] space-y-2.5">
                <li className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#3B2A20]">PHP {getItemsSubtotal(or).toFixed(2)}</span>
                </li>
                {or.order.discountAmount != null && Number(or.order.discountAmount) > 0 && (
                  <li className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-medium text-[#5C6B3B]">-PHP {Number(or.order.discountAmount).toFixed(2)}</span>
                  </li>
                )}
                {or.order.deliveryFee != null && (
                  <li className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-[#3B2A20]">PHP {Number(or.order.deliveryFee).toFixed(2)}</span>
                  </li>
                )}
                {or.order.tip != null && Number(or.order.tip) > 0 && (
                  <li className="flex justify-between">
                    <span>Tip</span>
                    <span className="font-medium text-[#3B2A20]">PHP {Number(or.order.tip).toFixed(2)}</span>
                  </li>
                )}
                <li className="flex justify-between border-t border-[#E7DCC9] pt-2.5 mt-1">
                  <span className="font-medium text-[#3B2A20]">Total</span>
                  <span className="font-semibold text-[#A65A34] text-base">PHP {or.order.order_price}</span>
                </li>
              </ul>
            </div>

            {isOngoing && or.order.order_status != "ASSIGNED" && or.order.order_status != "OUT_FOR_DELIVERY" && (
              <div className="space-y-2">
                <button
                  onClick={() => onCancelClick(or.order.orderId)}
                  className="w-full text-sm cursor-pointer px-4 py-2.5 bg-[#A65A34] text-white font-medium rounded-lg hover:bg-[#8B4A2A] transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {!isOngoing && or.order.order_status != "DELIVERED" | or.order.order_status != "CANCELLED" && (
              <div className="space-y-2">
                <button
                  onClick={() => onReorder(or)}
                  className="w-full text-sm cursor-pointer px-4 py-2.5 bg-[#A65A34] text-white font-medium rounded-lg hover:bg-[#8B4A2A] transition-colors"
                >
                  Reorder
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A65A34]/8">
        <svg className="h-8 w-8 text-[#A65A34]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">
        {tab === 'ongoing' ? 'No ongoing orders' : 'No past orders yet'}
      </p>
      <p className="mt-1 text-sm text-[#8A7862]">
        {tab === 'ongoing' ? "Orders you place will show up here." : 'Completed and cancelled orders will appear here.'}
      </p>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto bg-white border border-[#E7DCC9] rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-5 sm:px-10 sm:py-6 border-b border-[#E7DCC9] bg-[#FBF6EE]/60 flex justify-between">
        <div className="h-4 w-32 bg-[#E7DCC9] rounded" />
        <div className="h-6 w-20 bg-[#E7DCC9] rounded-full" />
      </div>
      <div className="px-6 py-6 sm:px-10 sm:py-8 space-y-4">
        <div className="h-16 bg-[#FBF6EE] border border-[#E7DCC9] rounded-xl" />
        <div className="h-16 bg-[#FBF6EE] border border-[#E7DCC9] rounded-xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

const OrderDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');

  const [orderDetails, setOrderDetails] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('ongoing');

  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showReorderToast, setShowReorderToast] = useState(false);
  const [reorderMessage, setReorderMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelId, setCancelId] = useState(0);

  const handleCancelClick = (id) => {
    setShowCancelConfirm(!showCancelConfirm);
    setCancelId(id);
  };

 
  useEffect(() => {
    if (location.state?.showPopup) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  }, [location.state]);

  const getOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/users/${user_ID}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error', error);
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  const getOrderDetails = async (page = 0) => {
    try {
      const response = await axios.get(`${API_URL}/delivery?page=${page}&size=${pageSize}&customerId=${user_ID}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const deliveries = response.data.content;

      const combined = await Promise.all(
        deliveries.map(async (delivery) => {
          const orderId = delivery.order.orderId;
          const itemsRes = await axios.get(`${API_URL}/orderItems/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
          return { ...delivery, orderItems: itemsRes.data };
        })
      );

      setOrderDetails(combined);
      setCurrentPage(response.data.number);
      setTotalPages(response.data.totalPages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error');
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  useEffect(() => {
    getOrderDetails(0);
    getOrders();
  }, []);

  const getMergedStatus = (or) => {
    if (or.order.order_status === 'CANCELLED') return 'History';
    if (or.order.order_status === 'COMPLETED' || or.delivery_status === 'DELIVERED' || or.order.order_status === 'DELIVERED') return 'History';
    return 'Ongoing';
  };

  const ongoingOrders = orderDetails.filter((or) => getMergedStatus(or) === 'Ongoing');
  const historyOrders = orderDetails.filter((or) => getMergedStatus(or) === 'History');
  const visibleOrders = activeTab === 'ongoing' ? ongoingOrders : historyOrders;

  const getItemsSubtotal = (or) =>
    (or.orderItems || []).reduce((sum, oi) => sum + (Number(oi.subtotal) || 0), 0);

  const handleTrackOrder = (id) => navigate(`/track-order/${id}`);

  // Moved here from OrderCard so it can use API_URL / token and trigger the toast
  const handleReorder = async (or) => {
    const items = or.orderItems || [];

    const requests = items.map((item) => {
      const modifierOptionIds = (item.orderItemModifiers || []).map(
        (modifier) => modifier.modifierOptionId
      );

      const isCombo = item?.combo != null;

      // Mirrors buildItemSelections in BrowseCombos: one ComboItemBasketRequest
      // { catalogId, quantity, modifierOptionIds } per catalog item inside the combo.
      // ASSUMPTION: each orderItemModifiers entry carries the catalogId it belongs to.
      const itemSelections = isCombo
        ? (item.combo.comboItems || []).map((comboItem) => {
            const catalogId = comboItem.catalog?.catalogId;
            return {
              catalogId,
              quantity: comboItem.quantity,
              modifierOptionIds: (item.orderItemModifiers || [])
                .filter((m) => m.catalogId === catalogId)
                .map((m) => m.modifierOptionId),
            };
          })
        : [];

      // Combo payload matches ComboBasketRequest
      // (comboId, quantity, itemSelections, specialInstructions)
      const payload = isCombo
        ? {
            comboId: item.combo.comboId,
            quantity: item.quantity,
            itemSelections,
            specialInstructions: item.specialInstructions ?? null,
          }
        : {
            userId: or?.order?.customer?.userId,
            catalogId: item.catalog.catalogId,
            quantity: item.quantity,
            modifierOptionIds: modifierOptionIds,
            specialInstructions: item.specialInstructions ?? null,
          };

      const endpoint = isCombo
        ? `combo/${item.combo.comboId}`
        : `catalog/${item.catalog.catalogId}`;

      return axios.post(`${API_URL}/basket/users/${or?.order?.customer?.userId}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
    });

    const results = await Promise.allSettled(requests);

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const errorMsg = result.reason.response?.data?.message || result.reason.message;
        console.error(`❌ Failed: ${items[index].orderItemsId}. Error: ${errorMsg}`);
      }
    });

    const added = results.filter((r) => r.status === 'fulfilled').length;

    if (added === 0) {
      setReorderMessage("Couldn't add items to your basket.");
    } else if (added < items.length) {
      setReorderMessage(`${added} of ${items.length} items added to your basket.`);
    } else {
      setReorderMessage('Items added to your basket!');
    }

    setShowReorderToast(true);
    setTimeout(() => setShowReorderToast(false), 3000);
  };

  const cancelOrder = async (e) => {
    e.preventDefault();
    try {
      const putData = { order_status: 'Cancelled' };
      await axios.patch(`${API_URL}/orders/cancel/${cancelId}`, putData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      setShowCancelConfirm(false);
      setShowPopup2(false);
      setTimeout(() => setShowPopup2(false), 3000);
      getOrderDetails(currentPage);
    } catch (error) {
      console.log('Failed to Update Status');
      if (error.response?.data === 'Too many requests' || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 5;
        setRetryTime(retryAfter);
        setError('Too Many Requests');
        setShowRateLimitPopup(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header />

      <div className="px-6 sm:px-10 py-9 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">My Orders</h1>
            <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[#E7DCC9] bg-white p-1">
          {[
            { key: 'ongoing', label: 'Ongoing', count: ongoingOrders.length },
            { key: 'history', label: 'History', count: historyOrders.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#A65A34] text-white shadow-sm'
                  : 'text-[#6B5745] hover:bg-[#A65A34]/8'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-[#A65A34]/10 text-[#A65A34]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {showRateLimitPopup && (
        <RateLimitPopup
          error={error}
          retryTime={retryTime}
          setRetryTime={setRetryTime}
          setShowPopup={setShowRateLimitPopup}
          showPopup={showRateLimitPopup}
          fetchData={getOrderDetails}
          currentPage={currentPage}
        />
      )}

      <Toast show={showPopup} message="Order placed successfully!" />
      <Toast show={showPopup2} message="Order cancelled successfully!" />
      <Toast show={showReorderToast} message={reorderMessage} />

      <div className="px-4 sm:px-10 pb-16 space-y-5">
        {isLoading && (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        )}

        {!isLoading && visibleOrders.length === 0 && <EmptyState tab={activeTab} />}

        {!isLoading &&
          visibleOrders.map((or) => (
            <OrderCard
              key={or.order.orderId}
              order={or}
              isOngoing={activeTab === 'ongoing'}
              onTrack={handleTrackOrder}
              onCancelClick={handleCancelClick}
              onReorder={handleReorder}
              getItemsSubtotal={getItemsSubtotal}
            />
          ))}

        {!isLoading && orderDetails.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getOrderDetails} />
          </div>
        )}
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-[#3B2A20]/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white px-6 py-6 text-center text-[#3B2A20] shadow-xl border border-[#E7DCC9]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#A65A34]/10">
              <svg className="h-6 w-6 text-[#A65A34]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold mb-1.5 font-['Fraunces',serif]">Cancel this order?</h2>
            <p className="text-sm text-[#8A7862] mb-5">This can't be undone once confirmed.</p>

            <div className="space-y-2">
              <button
                onClick={cancelOrder}
                className="w-full cursor-pointer rounded-lg bg-[#A65A34] py-2.5 text-sm font-medium text-white hover:bg-[#8B4A2A] transition-colors"
              >
                Yes, cancel my order
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full cursor-pointer rounded-lg border border-[#E7DCC9] py-2.5 text-sm text-[#3B2A20] hover:bg-[#FBF6EE] transition-colors"
              >
                Keep order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;