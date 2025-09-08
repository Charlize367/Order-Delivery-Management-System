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
    <div className="header" style={isActive ? {marginLeft: "250px"} : {marginLeft: "0px"}}>
      <button className="openBtn" onClick={openNav}>☰</button>
      <h1 className="title">The Flavor Hub</h1>

      <div className="sidebar" style={isActive ? {width: "250px"} : {width: "0px"}}>
        <button className="closeBtn" onClick={openNav}>x</button>
        <ul className="link-list">
          <li className="navlink"><Link to = "/catalog_dashboard">Dashboard</Link></li>
        <li className="navlink"><Link to = "/orders">Orders</Link></li>
        <li className="navlink"><Link to = "/deliveries">Deliveries</Link></li>
        <li className="navlink"><Link to = "/customers">Customers</Link></li>
        <li className="navlink"><Link to = "/delivery_drivers">Delivery Drivers</Link></li>
        <li className="navlink"><Link onClick={logout}>Logout</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Header