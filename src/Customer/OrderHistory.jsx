import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const OrderHistory = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [order_ID, setOrderID] = useState(0);

  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          
          const firstOrderID = response.data[0].orders.order_ID;
          setOrderID(firstOrderID); 

          const response2 = await axios.get(`${API_BASE_URL}/orderItems/orders/${firstOrderID}`, {
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


     const getMergedStatus = (or) => {
        if (or.orders.order_status === "Cancelled") {
          return "History";
        } else if (or.orders.order_status === "Completed" || or.delivery_status === "Delivered") {
          return "History";
        } else {
          return "Ongoing";
        }
      };

      const ongoingOrders = orderDetails.filter(or => getMergedStatus(or) === "Ongoing");
      const historyOrders = orderDetails.filter(or => getMergedStatus(or) === "History");
    

      console.log(orderDetails);
      
  
  return (
    <div className="body">
      <Header />
      <h1 className="my-order-text">Order History</h1>
      {orderDetails.length > 0 && historyOrders.map((or) => {

      let mergedStatus = "";
      if (or.orders.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.orders.order_status === "Cancelled") mergedStatus = "Cancelled"; 
      else if (or.orders.order_status === "Preparing" || or.orders.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.orders.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
      
     
     

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
            {or.orderItems.map(oi => (
        <li className="order-items-div">
          <img className="order-img" src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`}/>
          <div className="order-details-div">
          <p className="order-item-name">{oi.order_catalog.catalogName}</p>
          <p className="order-quantity">x{oi.quantity}</p>
          <p className="order-price">PHP {oi.order_catalog.catalog_price}</p>
          </div>
        <p className="order-subtotal">PHP {oi.subtotal} </p>
        
       
      </li>
            ))}
      </ul>  
      <hr className="orders-hr"/>
      
       <p className="order-total">Total: PHP {or.orders.order_price}</p>
     
      <hr className="orders-hr"/>
      
      
     
      
      </div>
      
      </div>
   
    </div>
      )})}
  </div>


)
}

export default OrderHistory;