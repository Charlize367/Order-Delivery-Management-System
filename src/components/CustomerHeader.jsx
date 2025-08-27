import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'

const Header = () => {

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
          <li className="navlink"><Link to = "/browse">Browse Menu</Link></li>
        <li className="navlink"><Link to = "/basket">Basket</Link></li>
        <li className="navlink"><Link to = "/order">Orders</Link></li>
        <li className="navlink"><Link to = "/order_history">Order History</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Header