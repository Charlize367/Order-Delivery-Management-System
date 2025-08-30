import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation} from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const OrderDetails = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [order_ID, setOrderID] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);



  useEffect(() => {
    if (location.state?.showPopup) {
      setShowPopup(true);

      
      const timer = setTimeout(() => setShowPopup(false), 3000);
      
    }
  }, [location.state]);


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

      const goToHistory = () => {
        navigate('/order_history');
      }

      const cancelOrder = async () => {
         try {

        const putData = {
          order_status: 'Cancelled'
        }

        const response = await axios.put(`http://localhost:8083/orders/orderStatus/${order_ID}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);

                    setShowPopup2(true);

   
                setTimeout(() => setShowPopup2(false), 3000);
        
      getOrderDetails();
      console.log(putData);
        }
        catch{
          console.log("Failed to Update Status")
        }
      }
      
  
  return (
    <div className="body">
      <Header />
      <h1 className="my-order-text">My Orders</h1>
      <button className="orderHistoryBtn" onClick={goToHistory}>Order History</button>
      
       {showPopup && (
            <div className="order-popup">
              Order placed successfully!
            </div>
              )}

              {showPopup2 && (
            <div className="cancel-popup">
              Order cancelled successfully!
            </div>
              )}

      {orderDetails.length > 0 && ongoingOrders.map((or) => {

      let mergedStatus = "Order Placed";
      if (or.orders.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.orders.order_status === "Preparing" || or.orders.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.orders.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
      else if (or.orders.order_status === "Cancelled") mergedStatus = "Cancelled"; 
     
     

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
         
          <img className="order-img" src={`http://localhost:8083/images/${oi.order_catalog.catalog_image}`}/>
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
      <div className="order-details-bottom">
      <div className="delivery-details-container">
       <p className="delivery_driver"><b>Driver:</b> {!or.deliveryMen || or.deliveryMen === null 
          ? "No driver assigned yet" : or.deliveryMen.username}</p>
        <p className="estimated_time"><b>Estimated Time of Delivery: </b> {!or.estimated_time || or.estimated_time === null
          ? "Pending" : or.estimated_time} </p>
        <p className="estimated_time"><b>Time Delivered:</b> {!or.delivered_time || or.delivered_time === null
          ? "Not delivered yet" : or.delivered_time} </p>

    </div>
      <button className="cancelOrderBtn" onClick ={cancelOrder}>Cancel Order</button>
      </div>
      
     
      
      </div>
      
      </div>
   
    </div>
      )})}
  </div>
    
      
  
  )
}

export default OrderDetails