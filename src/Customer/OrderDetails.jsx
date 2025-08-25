import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'

const OrderDetails = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);

  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
          setOrderDetails(response.data);
          
          } catch {
            console.error("Error");
            console.log(response);
          
          }
  }

  useEffect(() => {
        getOrderDetails();
    }, []);

   
   


  return (
    <div className="body">
      <Header />
      {orderDetails.map(o => (
      <div className="order-detail-container">
        <div className="order-top">
          
          <p className="order-id">{o.orders.order_ID}</p>
          <p className="order-date">{o.orders.order_date}</p>
          <p className="order-status">{o.orders.order_status}</p>
        
        </div>
        <hr />
        <h1 className="my-order-text">My Orders</h1>
         <ul className="order-summary">
            
        <li className="order-items-div">
          <img className="order-img" />
          <p className="order-item-name"></p>
          <p className="order-quantity">x</p>
          <div className="order-prices-div">
            <p className="order-price">PHP</p>
            <p className="order-subtotal">Subtotal: PHP  </p>
            
          </div>
        
      </li>
      
              
              
      </ul>
        
      <p className="order-total">Total: PHP </p>
        <button className="cancelOrderBtn">Cancel Order</button>
    </div>
      ))}
  </div>
  )
}

export default OrderDetails