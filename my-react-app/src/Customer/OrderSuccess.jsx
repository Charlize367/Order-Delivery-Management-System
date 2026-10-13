import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

/*
  OrderSuccess.jsx
  Route suggestion: /order/:id/success  (matches the Stripe successUrl from checkout)

  Fonts used (add to index.html <head> or import in your CSS):
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

  Palette (from brief):
    rust        #A65A34   primary / stamp / accents
    cream       #F7F1E8   page background
    coffee      #3B2A20   body text
    sage        #8A9A5B   success accent, used sparingly
*/

const API_URL = import.meta.env.VITE_API_URL;

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stamped, setStamped] = useState(false);

  console.log(order);
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    axios
      .get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));

    // trigger the stamp animation shortly after mount
    const t = setTimeout(() => setStamped(true), 250);
    return () => clearTimeout(t);
  }, [id]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#F7F1E8" }}
    >
      <div className="w-full max-w-md">
        {/* Receipt ticket */}
        <div
          className="relative bg-[#FFFDF8] shadow-xl px-8 pt-10 pb-8"
          style={{
            transform: "rotate(-0.6deg)",
            borderRadius: "2px",
            boxShadow: "0 20px 40px -12px rgba(59, 42, 32, 0.25)",
          }}
        >
          {/* Stamp */}
          <div
            className="absolute -top-8 -right-6 select-none pointer-events-none"
            style={{
              transform: stamped
                ? "rotate(12deg) scale(1)"
                : "rotate(12deg) scale(1.6)",
              opacity: stamped ? 1 : 0,
              transition: "opacity 0.35s ease-out, transform 0.35s ease-out",
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center border-4"
              style={{ borderColor: "#A65A34", color: "#A65A34" }}
            >
              <div className="text-center leading-none">
                <div
                  className="text-[10px] tracking-[0.2em] font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  ORDER
                </div>
                <div
                  className="text-lg font-bold tracking-wide"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  PAID
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: "#8A9A5B", fontFamily: "'Inter', sans-serif" }}
          >
            Confirmed
          </p>
          <h1
            className="text-3xl mb-1"
            style={{
              color: "#3B2A20",
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            We're on it.
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "#3B2A20", opacity: 0.65, fontFamily: "'Inter', sans-serif" }}
          >
            Your payment went through and the kitchen has your order.
          </p>

          {/* Perforated divider */}
          <Perforation />

          {/* Order details, receipt-style */}
          <div
            className="py-6 text-sm"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3B2A20" }}
          >
            <div className="flex justify-between mb-3">
              <span className="opacity-60">ORDER NO.</span>
              <span className="font-medium">#{loading ? "…" : order?.orderId ?? id}</span>
            </div>

            {!loading && order?.orderItems?.length > 0 && (
  <div className="space-y-2 mb-4">
    {order.orderItems.map((item, i) => {
      const name =
        item.catalog?.catalogName ??
        item.combo?.name ??
        "Item";

      const price =
      item.subtotal

      return (
        <div key={i} className="flex justify-between">
          <span className="opacity-80">
            {item.quantity}× {name}
          </span>

          <span>
            ₱{(price * item.quantity).toFixed(2)}
          </span>
        </div>
      );
    })}
  </div>
)}

            <div className="space-y-2 mb-4">
              
                  <div className="flex justify-between">
                    <span className="opacity-80">
                      Tax
                    </span>
                    <span>
                      ₱{(order?.taxAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="opacity-80">
                      Delivery Fee
                    </span>
                    <span>
                      ₱{(order?.deliveryAmount ?? 0).toFixed(2)}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span className="opacity-80">
                      Discount
                    </span>
                    <span>
                      -₱{(order?.discountAmount ?? 0).toFixed(2)}
                    </span>
                    </div>
                 
                  <div className="flex justify-between">
                    <span className="opacity-80">
                      Tip
                    </span>
                    <span>
                      ₱{(order?.tip ?? 0).toFixed(2)}
                    </span>
                  </div>
              
              </div>
              
            <div
              className="flex justify-between pt-3 border-t"
              style={{ borderColor: "rgba(59, 42, 32, 0.15)" }}
            >

              

              <span className="opacity-60">TOTAL</span>
              <span className="font-medium text-base">
                ₱{loading ? "…" : (order?.order_price ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <Perforation />

          {/* Actions */}
          <div className="pt-6 space-y-3">
            <Link
              to={`/order`}
              className="block w-full text-center py-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#A65A34",
                color: "#F7F1E8",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "3px",
              }}
            >
              Track your order
            </Link>
            <Link
              to="/browse"
              className="block w-full text-center py-3 text-sm transition-opacity hover:opacity-70"
              style={{
                color: "#3B2A20",
                opacity: 0.6,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Back to menu
            </Link>
          </div>
        </div>

        {/* Torn edge */}
        <TornEdge />
      </div>
    </div>
  );
}

function Perforation() {
  return (
    <div
      className="w-full flex gap-[6px] overflow-hidden"
      style={{ height: "1px" }}
      aria-hidden="true"
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="flex-shrink-0"
          style={{
            width: "4px",
            height: "1px",
            backgroundColor: "rgba(59, 42, 32, 0.2)",
          }}
        />
      ))}
    </div>
  );
}

function TornEdge() {
  // simple zigzag bottom edge to sell the "torn receipt" feel
  const teeth = 22;
  const points = Array.from({ length: teeth }, (_, i) => {
    const x = (i / (teeth - 1)) * 100;
    const y = i % 2 === 0 ? 0 : 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="w-full block"
      style={{ height: "10px", marginTop: "-1px" }}
      aria-hidden="true"
    >
      <polygon points={`0,10 ${points} 100,10`} fill="#F7F1E8" />
    </svg>
  );
}