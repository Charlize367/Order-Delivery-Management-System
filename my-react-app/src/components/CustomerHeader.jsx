import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../Auth/AuthContext';

const Header = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { userLogout } = useAuth();
  
  const { login } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
  const [showLogoutSuccessPopup, setShowLogoutSuccessPopup] = useState(false);
  const { logoutPopup, setLogoutPopup } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navRef = useRef(null);
  
  
   
     const handleLogoutClick = () => {
       setShowLogoutConfirm(!showLogoutConfirm); 
     };


   useEffect(() => {
         if (location.state?.popup) {
          
           setShowLoginSuccessPopup(true);
       
           setTimeout(() => setShowLoginSuccessPopup(false), 3000);
         }
       }, []);
   
       console.log(location.state?.logout);
     useEffect(() => {
         if (logoutPopup) {
          
           setShowLogoutSuccessPopup(true);
       
           setTimeout(() => setShowLogoutSuccessPopup(false), 3000);
           setLogoutPopup(false);
         }
       }, [logoutPopup]);



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

  const goToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
        
      }
    })
  }


  const goToRegister = () => {
    navigate("/register", {
      state: {
        from: location.pathname + location.search,
        action: "ADD_TO_BASKET"
      }
    })
  }



  const openNav = () => {
    setIsActive(!isActive);
  };

  const closeNav = () => {
    setIsActive(isActive);
  }

  return (
  

    <nav ref={navRef} class="bg-gradient-to-r from-[#56C789] to-[#096E22] text-white w-full z-20 top-0 start-0 border-default">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        
     
            <span class="self-center text-xl text-heading font-semibold whitespace-nowrap">The Flavor Hub</span>

        <div className="flex items-center">
          {!token && (
             <div className='flex hover:bg-green-600 rounded-lg p-2 mr-5 md:mr-9'>
              <img className="w-7 h-7 mr-2" src="/login.svg" />
              <button type="button" onClick={goToLogin} class="block cursor-pointer ">Sign In</button>
            </div>
            )}
          <div className=' hover:bg-green-600 rounded-lg p-1 mr-9'>
              <button className="cursor-pointer" onClick={() => navigate('/basket')}><img className="w-7 h-7" src="/basket.svg" /></button>
        </div>
        <button data-collapse-toggle="navbar-hamburger" onClick={openNav} type="button" class="inline-flex cursor-pointer items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base hover:bg-neutral-tertiary hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-hamburger" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
        </button>
        
        </div>
        {isActive && (
        <div class="w-full" id="navbar-hamburger">
          <ul class="flex flex-col font-medium mt-4 pt-4 bg-neutral-secondary-soft space-y-2 border-t border-default">
            <li className='hover:bg-gradient-to-r from-[#45B16A] to-[#075E1A] p-2'>
              <Link to = "/browse"  class="block py-2 px-3 text-white bg-brand rounded md:bg-transparent md:text-fg-brand md:p-0" aria-current="page">Browse Menu</Link>
            </li>

            {token && (
            <>
            
            <li className='hover:bg-gradient-to-r from-[#45B16A] to-[#075E1A] p-2'>
              <Link to = "/order" class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Orders</Link>
            </li>
            <li className='hover:bg-gradient-to-r from-[#45B16A] to-[#075E1A] p-2'>
              <Link to = "/order_history" class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Order History</Link>
            </li>
            
           
             <li className='hover:bg-gradient-to-r from-[#45B16A] to-[#075E1A] p-2'>
              <button onClick={handleLogoutClick} class="block py-2 px-3 cursor-pointer text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Logout</button>
            </li>
            </>
            )}

            
          </ul>
        </div>
        )}
      </div>

      {showLoginSuccessPopup && (
        <div className="fixed top-5 right-5 z-99 flex w-full max-w-xs p-4 text-gray-900 bg-none rounded-lg" role="alert">
          <div className="flex items-center w-full p-4 text-white bg-gray-800 rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-8 h-8 text-green-500 bg-green-100 rounded-lg">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">{location.state?.popup || "Logged in successfully."}</div>
          </div>
        </div>
      )}

      
    

  {showLogoutSuccessPopup && (
        <div className="fixed top-5 right-5 z-99 flex w-full max-w-xs p-4 text-gray-900 bg-none rounded-lg" role="alert">
          <div className="flex items-center w-full p-4 text-white bg-gray-800 rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-8 h-8 text-green-500 bg-green-100 rounded-lg">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">{location.state?.logout || "Logged out successfully."}</div>
          </div>
        </div>
      )}

    {showLogoutConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-xs rounded-lg bg-[#1e1e1e] px-6 py-5 text-gray-200 text-center shadow-lg">
      
      <h2 className="text-base font-semibold mb-2">Confirm Logout</h2>
      <p className="text-sm text-gray-400 mb-4">
        Are you sure you want to logout?
      </p>

      <div className="space-y-2">
        <button
          onClick={() => {
            userLogout();
            setShowLogoutConfirm(false);
          }}
          className="w-full cursor-pointer rounded-md bg-gradient-to-r from-[#56C789] to-[#096E22] py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Yes, Logout
        </button>

        <button
          onClick={handleLogoutClick}
          className="w-full cursor-pointer rounded-md border border-[#56C789] py-2 text-sm text-[#56C789] hover:bg-[#56C789]/10 transition"
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

export default Header