import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useAuth } from '../Auth/AuthContext';

const Header = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const { logout } = useAuth();
  const [isActive, setIsActive] = useState(false);

  const openNav = () => {
    setIsActive(!isActive);
  };

  const closeNav = () => {
    setIsActive(isActive);
  }

  return (
   <nav class="bg-gradient-to-r from-[#56C789] to-[#096E22] text-white w-full z-20 top-0 start-0 border-default">
         <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
           
        
               <span class="self-center text-xl text-heading font-semibold whitespace-nowrap">The Flavor Hub</span>
         
           <button data-collapse-toggle="navbar-hamburger" onClick={openNav} type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base hover:bg-neutral-tertiary hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-hamburger" aria-expanded="false">
               <span class="sr-only">Open main menu</span>
               <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
           </button>
           {isActive && (
           <div class="w-full" id="navbar-hamburger">
             <ul class="flex flex-col font-medium mt-4 pt-4 bg-neutral-secondary-soft space-y-2 border-t border-default">
               <li>
                 <Link to = "/deliveries_list"  class="block py-2 px-3 text-white bg-brand rounded md:bg-transparent md:text-fg-brand md:p-0" aria-current="page">Assigned Deliveries</Link>
               </li>
               
                <li>
                 <Link onClick={logout} class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">Logout</Link>
               </li>
             </ul>
           </div>
           )}
         </div>
       </nav>
  )
}

export default Header