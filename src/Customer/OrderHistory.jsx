import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const OrderHistory = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderId] = useState(0);

  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          
          const firstorderId = response.data[0].orders.orderId;
          setOrderId(firstorderId); 

          const response2 = await axios.get(`${API_BASE_URL}/orderItems/orders/${firstorderId}`, {
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

      
    //   <div className="order-details-map" key={or.orders.orderId}>
       
    //    <div className="order-items-div">
        
    //     <div className="order-detail-container" >
         
    //     <div className="order-top">
        
    //       <div className="orderId_txt"><p>Order</p><p className="order-id">{or.orders.orderId}</p></div>
          
         
    //       <p className="order-date">{or.orders.order_date}</p>
    //       <p className="order-status">{mergedStatus}</p>
       
    //     </div>
    //     <hr className="orders-hr"/>
    //    <ul className="order-summary">
    //         {or.orderItems.map(oi => (
    //     <li className="order-items-div">
    //       <img className="order-img" src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`}/>
    //       <div className="order-details-div">
    //       <p className="order-item-name">{oi.order_catalog.catalogName}</p>
    //       <p className="order-quantity">x{oi.quantity}</p>
    //       <p className="order-price">PHP {oi.order_catalog.catalog_price}</p>
    //       </div>
    //     <p className="order-subtotal">PHP {oi.subtotal} </p>
        
       
    //   </li>
    //         ))}
    //   </ul>  
    //   <hr className="orders-hr"/>
      
    //    <p className="order-total">Total: PHP {or.orders.order_price}</p>
     
    //   <hr className="orders-hr"/>
      
      
     
      
    //   </div>
      
    //   </div>
   
    // </div>
    <div class="bg-gray-50 px-4 py-8">
            <div class="max-w-screen-xl mx-auto">
                <div class="flex flex-wrap justify-between items-center gap-6">
                    <div class="max-w-96">
                        <h2 class="text-slate-900 text-2xl font-bold mb-3">Order History</h2>
                        <p class="text-base text-slate-600">View and manage your past orders</p>
                    </div>
                    
                </div>

                

                <div class="space-y-6 mt-6">
                    <div class="bg-white rounded-xl border border-gray-300 overflow-hidden p-6">
                        <div class="flex flex-wrap justify-between gap-6">
                            <div class="max-w-96">
                                <div class="flex items-center gap-4">
                                    <span class="text-[15px] font-semibold text-slate-600">Order {or.orders.orderId}</span>
                                    <span class="px-3 py-1.5 bg-green-100 text-green-900 text-xs font-medium rounded-md">{mergedStatus}</span>
                                </div>
                                <p class="text-slate-600 text-sm mt-3">Placed on {or.orders.order_date}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-lg font-semibold text-slate-900">PHP {or.orders.order_price}</p>
                                
                            </div>
                        </div>

                        <hr class="border-gray-300 my-6" />

                        <div class="flex flex-wrap items-center gap-8">
                          {or.orderItems.map(oi => (
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 bg-gray-100 p-1 rounded-md overflow-hidden">
                                    <img src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`} alt="Product" class="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p class="text-[15px] font-medium text-slate-900">{oi.order_catalog.catalogName}</p>
                                    <p class="text-xs text-slate-600 mt-1">Qty: {oi.quantity}</p>
                                </div>
                            </div>
                          ))}
                        </div>

                        
                    </div>

                    
                </div>


                
            </div>
        </div>
      )})}
  </div>


)
}

export default OrderHistory;