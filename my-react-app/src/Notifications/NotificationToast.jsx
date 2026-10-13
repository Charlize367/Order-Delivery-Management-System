import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNotifications } from "./NotificationContext";

const TYPE_STYLES = {
  success: {
    iconBg: "rgba(138, 154, 91, 0.15)",
    iconColor: "#8A9A5B",
    icon: (
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
    ),
  },

  error: {
    iconBg: "rgba(220, 38, 38, 0.12)",
    iconColor: "#DC2626",
    icon: (
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm1 13.5H9v-2h2Zm0-3.5H9V5h2Z" />
    ),
  },

  warning: {
    iconBg: "rgba(166, 90, 52, 0.15)",
    iconColor: "#A65A34",
    icon: (
      <path d="M10.91 1.98a1.05 1.05 0 0 0-1.82 0L.98 16.02a1.05 1.05 0 0 0 .91 1.58h16.22a1.05 1.05 0 0 0 .91-1.58ZM11 15H9v-2h2Zm0-4H9V7h2Z" />
    ),
  },

  info: {
    iconBg: "rgba(166, 90, 52, 0.15)",
    iconColor: "#A65A34",
    icon: (
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm1 14H9v-6h2Zm0-8H9V4.5h2Z" />
    ),
  },
};

function NotificationToast() {
  const { toast, showToast } = useNotifications();

  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return;

    setLeaving(false);

    const timer = setTimeout(() => {
      setLeaving(true);

      setTimeout(() => {
        showToast(null);
      }, 200);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, showToast]);

  if (!toast) return null;

  const style =
    TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  const handleDismiss = () => {
    setLeaving(true);

    setTimeout(() => {
      showToast(null);
    }, 200);
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-5 right-5 z-50 flex items-start w-full max-w-xs p-4 rounded-xl shadow-lg border border-[#E7DCC9] bg-[#3B2A20] text-[#F7F1E8] transition-all duration-200 ease-out ${
        leaving
          ? "opacity-0 translate-x-2"
          : "opacity-100 translate-x-0"
      }`}
    >
      <div
        className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-lg"
        style={{
          backgroundColor: style.iconBg,
          color: style.iconColor,
        }}
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {style.icon}
        </svg>
      </div>

      <div className="ms-3 flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F7F1E8]">
          Notification
        </p>

        <p className="text-sm font-normal text-[#F7F1E8]/90 break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="ms-2 -mt-1 -me-1 inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#F7F1E8]/50 hover:text-[#F7F1E8] hover:bg-[#F7F1E8]/10 transition-colors duration-150"
      >
        <svg
          className="h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>

        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}

export default NotificationToast;