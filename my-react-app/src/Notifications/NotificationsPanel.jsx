import { useNotifications } from "./NotificationContext";

const IconBell = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5.2 1.7 6.1a1 1 0 0 1-.8 1.6H5.1a1 1 0 0 1-.8-1.6C5 14.2 6 12.5 6 9Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function NotificationsPanel() {
  const { notifications, markAsRead } = useNotifications();

  const handleMarkAsRead = (id) => {
    markAsRead?.(id);
  };

  return (
    <div className="fixed top-[70px] right-[20px] z-99 w-[320px] overflow-hidden rounded-2xl border border-[#26201B]/8 bg-white shadow-[0_12px_36px_rgba(38,32,27,0.16)]">
      <div className="flex items-center justify-between border-b border-[#26201B]/8 bg-[#FBF6EE] px-4 py-3.5">
        <h4 className="text-sm font-semibold tracking-tight text-[#26201B]">Notifications</h4>
        {notifications.length > 0 && (
          <span className="rounded-full bg-[#A65A34]/12 px-2 py-0.5 text-[11px] font-semibold text-[#A65A34]">
            {notifications.length}
          </span>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3EF] text-[#26201B]/30">
              <IconBell className="h-5 w-5" />
            </span>
            <p className="text-sm text-[#26201B]/45">You're all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#26201B]/6">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#F5F3EF] ${
                  n.read ? "bg-white" : "bg-[#FBF6EE]"
                }`}
              >
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#A65A34]" />
                )}
                <div className={n.read ? "pl-5" : ""}>
                  <p
                    className={`text-sm leading-snug ${
                      n.read ? "text-[#26201B]/60" : "font-medium text-[#26201B]"
                    }`}
                  >
                    {n.message}
                  </p>
                  {formatTimestamp(n.timestamp || n.createdAt) && (
                    <p className="mt-1 text-xs text-[#26201B]/35">
                      {formatTimestamp(n.timestamp || n.createdAt)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}