import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useAuth } from '../Auth/AuthContext';

const Header = () => {

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
          <li className="navlink"><Link to = "/browse">Assigned Deliveries</Link></li>
        <li className="navlink"><Link onClick={logout} />Logout</li>
        </ul>
      </div>
    </div>
  )
}

export default Header