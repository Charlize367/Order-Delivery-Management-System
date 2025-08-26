import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const OrderDetails = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [order_ID, setOrderID] = useState(0);

  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          
          const firstOrderID = response.data[0].orders.order_ID;
          setOrderID(firstOrderID); 

          const response2 = await axios.get(`http://localhost:8083/orderItems/orders/${firstOrderID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          
          const deliveries = response.data;

          const combinedArray = deliveries.map(delivery => ({
            ...delivery,
            orderItems:response2.data
          }))
          setOrderDetails(combinedArray);
          
          } catch {
            console.error("Error");
            
          
          }
  }

  useEffect(() => {
        getOrderDetails();
    }, []);

    const cancelOrder = async(order_ID) => {
      
      try{
          const response = await axios.delete(`http://localhost:8083/orders/${order_ID}`, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         getOrderDetails();
        } catch {
          console.log("Failed to delete");
        }
      }

      console.log(orderDetails);
      
  
  return (
    <div className="body">
      <Header />
      <h1 className="my-order-text">My Orders</h1>
      {orderDetails.length > 0 && orderDetails.map((or) => {

      let mergedStatus = "Order Placed";
      if (or.orders.orderStatus === "Order Placed") mergedStatus = "Order Placed";
      else if (or.orders.orderStatus === "Preparing" || or.orders.orderStatus === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.orders.orderStatus === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
      else if (or.orders.orderStatus === "Cancelled") mergedStatus = "Cancelled"; 
     

      return (

      
      <div className="order-details-map" key={or.orders.order_ID}>
       
       <div className="order-items-div">
        
        <div className="order-detail-container" >
         
        <div className="order-top">
        
          <div className="order_id_txt"><p>Order</p><p className="order-id">{or.orders.order_ID}</p></div>
         
          <p className="order-date">{or.orders.order_date}</p>
          <p className="order-status">{mergedStatus}</p>
       
        </div>
        <hr className="orders-hr"/>
       <ul className="order-summary">
            
        <li className="order-items-div">
          <img className="order-img" src={`http://localhost:8083/images/${or.orderItems.order_catalog.catalog_image}`}/>
          <div className="order-details-div">
          <p className="order-item-name">{or.orderItems.order_catalog.catalog_name}</p>
          <p className="order-quantity">x{or.orderItems.quantity}</p>
          <p className="order-price">PHP {or.orderItems.order_catalog.catalog_price}</p>
          </div>
        <p className="order-subtotal">PHP {or.orderItems.subtotal} </p>
        
       
      </li>
            
      </ul>  
      <hr className="orders-hr"/>
      
       <p className="order-total">Total: PHP {or.orders.order_price}</p>
     
      <hr className="orders-hr"/>
      <div className="order-details-bottom">
      <div className="delivery-details-container">
        <p className="delivery_driver"><b>Driver:</b> {!or.delivery_men || or.delivery_men === null 
          ? "No driver assigned yet" : or.delivery_men}</p>
        <p className="estimated_time"><b>Estimated Time of Delivery: </b> {!or.estimated_time || or.estimated_time === null
          ? "Pending" : or.estimated_time} </p>
        <p className="estimated_time"><b>Time Delivered:</b> {!or.delivered_time || or.delivered_time === null
          ? "Not delivered yet" : or.delivered_time} </p>

    </div>
      <button className="cancelOrderBtn" onClick = {() => cancelOrder(or.orders.order_ID)}>Cancel Order</button>
      </div>
      
     
      
      </div>
      
      </div>
   
    </div>
      )})}
  </div>
    
      
  
  )
}

export default OrderDetails