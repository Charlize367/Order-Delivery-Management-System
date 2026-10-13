import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios';
import Header from '../components/AdminHeader';


// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const php = (n) =>
  `PHP ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const count = (n) => Number(n || 0).toLocaleString('en-US');

const ICONS = {
  revenue: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  orders: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z',
  average: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
};

function StatCard({ title, value, hint, icon, featured = false }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm sm:p-8 ${
        featured ? 'border-[#A65A34] bg-[#A65A34] text-white' : 'border-[#E7DCC9] bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${featured ? 'text-white/80' : 'text-[#8A7862]'}`}>{title}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            featured ? 'bg-white/15' : 'bg-[#A65A34]/10'
          }`}
        >
          <svg
            className={`h-5 w-5 ${featured ? 'text-white' : 'text-[#A65A34]'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </span>
      </div>
      <p
        className={`mt-6 break-words font-['Fraunces',serif] text-3xl font-semibold sm:text-4xl ${
          featured ? 'text-white' : 'text-[#3B2A20]'
        }`}
      >
        {value}
      </p>
      <p className={`mt-2 text-sm ${featured ? 'text-white/80' : 'text-[#8A7862]'}`}>{hint}</p>
    </div>
  );
}

// Shows how the average is derived from the other two numbers
function FormulaCard({ data }) {
  const parts = [
    { label: 'Total revenue', value: php(data.totalRevenue) },
    { label: 'Total orders', value: count(data.orderCount) },
    { label: 'Average order value', value: php(data.averageOrderValue), strong: true },
  ];
  const symbols = ['÷', '='];

  return (
    <div className="rounded-2xl border border-[#E7DCC9] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-['Fraunces',serif] text-lg font-semibold text-[#3B2A20]">How the average is worked out</h2>
      <p className="text-sm text-[#8A7862]">Average order value is total revenue divided by total orders.</p>

      <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {parts.map((p, i) => (
          <React.Fragment key={p.label}>
            <div
              className={`flex-1 rounded-xl px-5 py-4 ${
                p.strong ? 'bg-[#A65A34]/10' : 'bg-[#F7F1E8]'
              }`}
            >
              <p className="text-xs font-medium text-[#8A7862]">{p.label}</p>
              <p
                className={`mt-1 break-words font-['Fraunces',serif] text-xl font-semibold ${
                  p.strong ? 'text-[#A65A34]' : 'text-[#3B2A20]'
                }`}
              >
                {p.value}
              </p>
            </div>
            {i < symbols.length && (
              <span className="text-center text-2xl font-light text-[#8A7862]" aria-hidden="true">
                {symbols[i]}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  const block = 'animate-pulse rounded-2xl bg-[#E7DCC9]/60';
  return (
    <div aria-busy="true" aria-label="Loading analytics">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className={`${block} h-44`} />)}
      </div>
      <div className={`${block} mt-6 h-40`} />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DCC9] bg-white px-6 py-20 text-center shadow-sm"
      role="alert"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#B4483A]/10">
        <svg className="h-7 w-7 text-[#B4483A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">Couldn't load analytics</p>
      <p className="mt-1 max-w-sm text-sm text-[#8A7862]">
        Something went wrong while fetching your sales data. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-5 cursor-pointer rounded-full bg-[#A65A34] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8B4A2A]"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({ onRefresh }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DCC9] bg-white px-6 py-20 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A65A34]/10">
        <svg className="h-7 w-7 text-[#A65A34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.average} />
        </svg>
      </div>
      <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">No sales yet</p>
      <p className="mt-1 max-w-sm text-sm text-[#8A7862]">
        Revenue and order numbers will show up here once customers place orders.
      </p>
      <button
        onClick={onRefresh}
        className="mt-5 cursor-pointer rounded-full border border-[#E7DCC9] bg-white px-5 py-2.5 text-sm font-medium text-[#6B5745] transition-colors hover:bg-[#A65A34]/10"
      >
        Refresh
      </button>
    </div>
  );
}

function RateLimitPopup({ seconds, onClose, onRetry }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B2A20]/40 px-4" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-[#E7DCC9] bg-white p-6 text-center shadow-lg">
        <p className="font-['Fraunces',serif] text-lg font-semibold text-[#3B2A20]">Too many requests</p>
        <p className="mt-2 text-sm text-[#8A7862]">
          {seconds > 0
            ? `You've refreshed too often. You can try again in ${seconds}s.`
            : 'You can try again now.'}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full border border-[#E7DCC9] bg-white px-5 py-2 text-sm font-medium text-[#6B5745] transition-colors hover:bg-[#A65A34]/10"
          >
            Close
          </button>
          <button
            onClick={onRetry}
            disabled={seconds > 0}
            className="cursor-pointer rounded-full bg-[#A65A34] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8B4A2A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

const SalesAnalytics = () => {
  const token = localStorage.getItem('jwtToken');
  const API_URL = import.meta.env.VITE_API_URL;


  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [updatedAt, setUpdatedAt] = useState(null);

  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);

  const handleRateLimit = (err) => {
    if (err.response?.data === 'Too many requests' || err.response?.status === 429) {
      const retryAfter = parseInt(err.response.headers?.['retry-after'], 10) || 5;
      setRetryTime(retryAfter);
      setShowRateLimitPopup(true);
    }
  };

  // Calls GET /analytics/ -> { orderCount, totalRevenue, averageOrderValue }
  const fetchAnalytics = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await axios.get(`${API_URL}/analytics/sales`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setData(response.data ?? null);
      setUpdatedAt(new Date());
      setStatus('ready');
    } catch (err) {
      console.error('Failed to load analytics:', err);
      handleRateLimit(err);
      setStatus('error');
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Count down the rate-limit timer
  useEffect(() => {
    if (!showRateLimitPopup || retryTime <= 0) return;
    const id = setTimeout(() => setRetryTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [showRateLimitPopup, retryTime]);

  const reload = fetchAnalytics;

  const retryAfterLimit = () => {
    setShowRateLimitPopup(false);
    fetchAnalytics();
  };

  const isEmpty = status === 'ready' && (!data || data.orderCount === 0);

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-10">

        {/* Title */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">Sales Analytics</h1>
            <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]" />
          </div>

          <div className="flex items-center gap-3">
            {updatedAt && status === 'ready' && (
              <p className="text-sm text-[#8A7862]">
                Updated {updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            <button
              onClick={reload}
              disabled={status === 'loading'}
              className="cursor-pointer rounded-full border border-[#E7DCC9] bg-white px-4 py-2 text-sm font-medium text-[#6B5745] transition-colors hover:bg-[#A65A34]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8">
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState onRetry={reload} />}
          {isEmpty && <EmptyState onRefresh={reload} />}

          {status === 'ready' && data && !isEmpty && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <StatCard
                  featured
                  title="Total revenue"
                  value={php(data.totalRevenue)}
                  hint="Money earned from all counted orders"
                  icon={ICONS.revenue}
                />
                <StatCard
                  title="Total orders"
                  value={count(data.orderCount)}
                  hint="Orders placed by customers"
                  icon={ICONS.orders}
                />
                <StatCard
                  title="Average order value"
                  value={php(data.averageOrderValue)}
                  hint="What a typical order is worth"
                  icon={ICONS.average}
                />
              </div>

              <FormulaCard data={data} />
            </div>
          )}
        </div>
      </div>

      {showRateLimitPopup && (
        <RateLimitPopup
          seconds={retryTime}
          onClose={() => setShowRateLimitPopup(false)}
          onRetry={retryAfterLimit}
        />
      )}
    </div>
  );
};

export default SalesAnalytics;