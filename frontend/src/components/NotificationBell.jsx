import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
    const interval = setInterval(() => {
      api.unreadCount().then((r) => setUnread(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      const list = await api.listNotifications();
      setNotifications(list);
      if (unread > 0) {
        await api.markAllRead();
        setUnread(0);
      }
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative text-paper/80 hover:text-paper">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-magenta text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-ink/10 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-ink/10 font-semibold text-sm">Notifications</div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-newsgrey">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.story_id ? `/stories/${n.story_id}` : "#"}
                onClick={() => setOpen(false)}
                className="block p-3 border-b border-ink/5 last:border-0 hover:bg-paper text-sm"
              >
                {n.message}
                <p className="text-xs text-newsgrey mt-1">
                  {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}