import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../Auth/AuthContext';
import { useNotifications } from '../Notifications/NotificationContext';
import NotificationsPanel from '../Notifications/NotificationsPanel';

const IconBell = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5.2 1.7 6.1a1 1 0 0 1-.8 1.6H5.1a1 1 0 0 1-.8-1.6C5 14.2 6 12.5 6 9Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);

const DeliveryHeader = () => {
  const { logout } = useAuth();
  const { notifications } = useNotifications();
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();
  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(!showLogoutConfirm);
  };

  useEffect(() => {
    if (location.state?.popup) {
      setShowLoginSuccessPopup(true);
      setTimeout(() => setShowLoginSuccessPopup(false), 3000);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openNav = () => {
    setIsActive(!isActive);
  };

  return (
    <nav ref={navRef} className="bg-[#A65A34] text-[#F7F1E8] w-full z-20 top-0 start-0 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-4 sm:px-6 lg:px-8">

        <span className="self-center text-xl text-[#F7F1E8] font-semibold tracking-tight whitespace-nowrap">The Flavor Hub — Delivery</span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="relative flex cursor-pointer items-center justify-center rounded-lg p-2.5 text-[#F7F1E8] transition-colors duration-150 hover:bg-[#8A4A2A]"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F7F1E8] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F7F1E8] ring-2 ring-[#A65A34]" />
              </span>
            )}
          </button>

          <button data-collapse-toggle="navbar-hamburger" onClick={openNav} type="button" className="inline-flex cursor-pointer items-center p-2.5 w-11 h-11 justify-center text-sm text-[#F7F1E8] rounded-lg transition-colors duration-150 hover:bg-[#8A4A2A] focus:outline-none focus:ring-2 focus:ring-[#F7F1E8]/40" aria-controls="navbar-hamburger" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14" /></svg>
          </button>
        </div>

        {isActive && (
          <div className="w-full" id="navbar-hamburger">
            <ul className="flex flex-col font-medium mt-4 pt-3 pb-2 px-1 bg-[#8A4A2A]/25 rounded-xl space-y-1 border-t border-[#F7F1E8]/20">
              <li>
                <Link to="/deliveries_list" className="block py-3 px-4 text-[#F7F1E8] rounded-lg transition-colors duration-150 hover:bg-[#8A4A2A]" aria-current="page">Assigned Deliveries</Link>
              </li>
              <li>
                <Link onClick={handleLogoutClick} className="block py-3 px-4 text-[#F7F1E8] rounded-lg transition-colors duration-150 hover:bg-[#8A4A2A]">Logout</Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {showLoginSuccessPopup && (
        <div className="fixed top-5 right-5 z-99 flex w-full max-w-xs p-4 text-[#3B2A20] bg-none" role="alert">
          <div className="flex items-center w-full p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">{location.state?.popup || "Logged in successfully."}</div>
          </div>
        </div>
      )}

      {open && <NotificationsPanel />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-[#3B2A20]/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#F7F1E8] px-7 py-7 text-[#3B2A20] text-center shadow-2xl">

            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className="text-sm text-[#3B2A20]/70 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="space-y-3">
              <button
                onClick={logout}
                className="w-full cursor-pointer rounded-lg bg-[#A65A34] py-2.5 text-sm font-medium text-[#F7F1E8] transition-colors duration-150 hover:bg-[#8A4A2A]"
              >
                Yes, Logout
              </button>

              <button
                onClick={handleLogoutClick}
                className="w-full cursor-pointer rounded-lg border border-[#A65A34] py-2.5 text-sm text-[#A65A34] transition-colors duration-150 hover:bg-[#A65A34]/10"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </nav>
  )
}

export default DeliveryHeader