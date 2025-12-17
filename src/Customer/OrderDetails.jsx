import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation} from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'


const OrderDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderId] = useState(0);
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
            const response = await axios.get(`${API_BASE_URL}/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          
          const deliveries = response.data;

          const combined = await Promise.all(
      deliveries.map(async delivery => {
        const orderId = delivery.orders.orderId;

        const itemsRes = await axios.get(
          `${API_BASE_URL}/orderItems/orders/${orderId}`,
          { headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } }
        );

        return {
          ...delivery,
          orderItems: itemsRes.data
        };
      })
    );

    setOrderDetails(combined)
          
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

      const cancelOrder = async (e, orderId) => {
        e.preventDefault();
         try {

        const putData = {
          order_status: 'Cancelled'
        }

        const response = await axios.put(`${API_BASE_URL}/orders/orderStatus/${orderId}`, putData , {
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
      <h1 className="text-white text-4xl font-bold m-10">My Orders</h1>
     
      
      
       {showPopup && (
            <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Order placed successfully!</div>
        </div>
        </div>
   
              )}

              {showPopup2 && (
            <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Order cancelled successfully!</div>
        </div>
        </div>
   
              )}

      {orderDetails.length > 0 && ongoingOrders.map((or) => {

      let mergedStatus = "Order Placed";
      if (or.orders.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.orders.order_status === "Preparing" || or.orders.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.orders.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
       

   
     
     

      return (

      
//       <div className="order-details-map" key={or.orders.orderId}>
       
//        <div className="order-items-div">
        
//         <div className="order-detail-container" >
         
//         <div className="order-top">
        
//           <div className="orderId_txt"><p>Order</p><p className="order-id">{or.orders.orderId}</p></div>
          
         
//           <p className="order-date">{new Date(or.orders.order_date).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                       year: "numeric",
//                     })}</p>
//           <p className="order-status">{mergedStatus}</p>
       
//         </div>
//         <hr className="orders-hr"/>
//        <ul className="order-summary">
//              {or.orderItems.map(oi => (
//         <li className="order-items-div">
         
//           <img className="order-img" src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`}/>
//           <div className="order-details-div">
//           <p className="order-item-name">{oi.order_catalog.catalogName}</p>
//           <p className="order-quantity">x{oi.quantity}</p>
//           <p className="order-price">PHP {oi.order_catalog.catalog_price}</p>
//           </div>
//         <p className="order-subtotal">PHP {oi.subtotal} </p>
        
   
//       </li>
// ))}
//       </ul>  
//       <hr className="orders-hr"/>
      
//        <p className="order-total">Total: PHP {or.orders.order_price}</p>
     
//       <hr className="orders-hr"/>
//       <div className="order-details-bottom">
//       <div className="delivery-details-container">
//        <p className="delivery_driver"><b>Driver:</b> {!or.deliveryMen || or.deliveryMen === null 
//           ? "No driver assigned yet" : or.deliveryMen.username}</p>
//         <p className="estimated_time"><b>Estimated Time of Delivery: </b> {!or.estimated_time || or.estimated_time === null
//           ? "Pending" : (() => {
//         const [hours, minutes, seconds] = or.estimated_time.split(":").map(Number);
//         const date = new Date();
//         date.setHours(hours, minutes, seconds);
//         return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
//       })()} </p>
//         <p className="estimated_time"><b>Time Delivered:</b> {!or.delivered_time || or.delivered_time === null
//           ? "Not delivered yet" : (() => {
//         const [hours, minutes, seconds] = or.delivered_time.split(":").map(Number);
//         const date = new Date();
//         date.setHours(hours, minutes, seconds);
//         return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
//       })()} </p>

//     </div>
//       <button className="cancelOrderBtn" onClick ={cancelOrder}>Cancel Order</button>
//       </div>
      
     
      
//       </div>
      
//       </div>
   
//     </div>
<div class="p-4">
  
          <div class="max-w-6xl bg-[#232323] p-10 rounded-2xl mx-auto text-white">
              <div>
                  <h1 class="text-2xl font-semibold text-white">Order Summary</h1>
                  <p class="text-sm text-gray-200 mt-3">Your purchase was successful. Here’s a summary of your order details.</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-300 pb-2 mt-12">
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-white text-xs font-medium">Delivery Date</p>
                          <h6 class="text-base font-medium text-white">{new Date(or.orders.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</h6>
                      </div>
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-white text-xs font-medium">Order ID</p>
                          <h6 class="text-base font-medium text-white">#{or.orders.orderId}</h6>
                      </div>
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-gray-200 text-xs font-medium">Order Status</p>
                          <h6 class="text-base font-medium text-white">{mergedStatus}</h6>
                      </div>
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-gray-200 text-xs font-medium">Address</p>
                          <h6 class="text-base font-medium text-white">{or.address}</h6>
                      </div>
                      
                  </div>
              </div>

              <div className="flex">
              <div class="grid lg:grid-cols-3 gap-10 mt-12 max-lg:max-w-2xl max-lg:mx-auto">
                {or.orderItems.map(oi => (
                  <div class="lg:col-span-2 space-y-4">
                      <div class="grid sm:grid-cols-3 items-center gap-4">
                          <div class="col-span-2 flex items-center gap-4">
                              <div class="w-28 h-28 max-sm:w-24 max-sm:h-24 shrink-0 bg-gray-100 p-2 rounded-md">
                                  <img src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`} class="w-full h-full object-contain" />
                              </div>
                              <div>
                                  <h3 class="sm:text-base text-sm font-semibold text-white">{oi.order_catalog.catalogName}</h3>
                                  <div class="mt-2">
                                      <p class="text-xs font-medium text-gray-200 mt-1">Qty: {oi.quantity}</p>
                                  </div>
                              </div>
                          </div>
                          <div class="sm:ml-auto">
                              <h4 class="sm:text-lg text-base font-semibold text-white">PHP {oi.subtotal}</h4>
                          </div>
                      </div>

                      <hr class="border-gray-300" />

                      </div>
                ))}
                <div >
                  <div class="bg-[#202020] border border-[#232323] rounded-md p-4 h-max">
                      <h3 class="text-base font-semibold text-white border-b border-gray-300 pb-2">Billing details</h3>
                      <ul class="font-medium mt-6 space-y-4">
                         
                          
                          
                          <li class="flex flex-wrap gap-4 text-[15px]">Total <span class="ml-auto text-white font-semibold">PHP {or.orders.order_price}</span></li>
                      </ul>
                      <div class="mt-8 space-y-3">
                          <button onClick ={(e) => cancelOrder(e, or.orders.orderId)} type="button" class="text-sm px-4 py-2.5 w-full font-medium tracking-wide bg-gradient-to-r from-[#56C789] to-[#096E22] text-white rounded-md cursor-pointer">Cancel Order</button>
                          <button type="button" class="text-sm px-4 py-2.5 w-full font-medium tracking-wide bg-transparent text-white border border-gray-300 rounded-md cursor-pointer">Continue Shopping  </button>
                      </div>
                  </div>

                  <div class="bg-[#202020] border border-[#232323] rounded-md p-4 mt-4 h-max">
                      <h3 class="text-base font-semibold text-white border-b border-gray-300 pb-2">Delivery Details</h3>
                      <ul class="font-medium mt-6 space-y-4">
                         
                          
                          
                          <li class="flex flex-wrap gap-4 text-[15px]">Estimated Time <span class="ml-auto text-white font-semibold">{!or.estimated_time || or.estimated_time === null
          ? "Pending" : (() => {
        const [hours, minutes, seconds] = or.estimated_time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
      })()}</span></li>

      <li class="flex flex-wrap gap-4 text-[15px]">Delivered Time <span class="ml-auto text-white font-semibold">{!or.delivered_time || or.delivered_time === null
          ? "Not delivered yet" : (() => {
        const [hours, minutes, seconds] = or.delivered_time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
      })()}</span></li>

      <li class="flex flex-wrap gap-4 text-[15px]">Assigned Driver <span class="ml-auto text-white font-semibold">{!or.deliveryMen || or.deliveryMen === null 
          ? "No driver assigned yet" : or.deliveryMen.username}</span></li>
                      </ul>
                </div>
                  </div>
                  </div>

                  
              </div>
          </div>
      </div>
      )})}
  </div>
    
      
  
  )
}

export default OrderDetails