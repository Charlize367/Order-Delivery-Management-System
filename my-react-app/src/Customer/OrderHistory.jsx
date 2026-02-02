import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination';
import RateLimitPopup from '../components/RateLimitPopup';


const OrderHistory = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderId] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

  const getOrderDetails = async (page = 0) => {
      try {
              const response = await axios.get(`${API_URL}/delivery?page=${page}&size=${pageSize}&customerId=${user_ID}`, {
                headers: {
                          'Authorization' : `Bearer ${token}`,
                          'Content-Type': 'application/json'
                      }});
  
  
            console.log(response);
            const deliveries = response.data.content;
  
            const combined = await Promise.all(
        deliveries.map(async delivery => {
          const orderId = delivery.order.orderId;
  
          const itemsRes = await axios.get(
            `${API_URL}/orderItems/orders/${orderId}`,
            { headers: {
                          'Authorization' : `Bearer ${token}`,
                          'Content-Type': 'application/json'
                      } }
          );
           console.log(itemsRes);
  
          return {
            ...delivery,
            orderItems: itemsRes.data
          };
        })
      );
  
      
      setOrderDetails(combined);
      setCurrentPage(response.data.number);
      setTotalPages(response.data.totalPages);
            
            } catch (error) {
              console.error("Error");
              if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
              
            
            }
    }
  
    useEffect(() => {
          getOrderDetails(0);
      }, []);
  console.log(orderDetails);


     const getMergedStatus = (or) => {
        if (or.order.order_status === "Cancelled") {
          return "History";
        } else if (or.order.order_status === "Completed" || or.delivery_status === "Delivered") {
          return "History";
        } else {
          return "Ongoing";
        }
      };

     
      const historyOrders = orderDetails.filter(or => getMergedStatus(or) === "History");
    

      console.log(orderDetails);
      
  
  return (
    <div className="body">
      <Header />
      <h1 className="text-white text-4xl font-bold m-10">Order History</h1>

      {historyOrders.length == 0 && (
            <p className="flex justify-center text-white text-lg">No order history found.</p>
        )}

      {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getOrderDetails} currentPage={currentPage} />
      )}

      {orderDetails.length > 0 && historyOrders.map((or) => {

      let mergedStatus = "";
      if (or.order.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.order.order_status === "Cancelled") mergedStatus = "Cancelled"; 
      else if (or.order.order_status === "Preparing" || or.order.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.order.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
      
     
     

      return (

      
    
    <div class="bg-transparennt px-4 py-8">
            <div class="max-w-screen-xl mx-auto">
                <div class="flex flex-wrap justify-between items-center gap-6">
                    <div class="max-w-96">
                       
                        <p class="text-base text-white">View and manage your past orders</p>
                    </div>
                    
                </div>

                

                <div class="space-y-6 mt-6">
                    <div class="bg-[#232323] rounded-xl text-white overflow-hidden p-6">
                        <div class="flex flex-wrap justify-between gap-6">
                            <div class="max-w-96">
                                <div class="flex items-center gap-4">
                                    <span class="text-[15px] font-semibold text-white">Order {or.order.orderId}</span>
                                    <span class="px-3 py-1.5 bg-green-100 text-green-900 text-xs font-medium rounded-md">{mergedStatus}</span>
                                </div>
                                <p class="text-white text-sm mt-3">Placed on {or.order.order_date}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-lg font-semibold text-white">PHP {or.order.order_price}</p>
                                
                            </div>
                        </div>

                        <hr class="border-gray-300 my-6" />

                        <div class="flex flex-wrap items-center gap-8">
                          {or.orderItems.map(oi => (
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 bg-gray-100 p-1 rounded-md overflow-hidden">
                                    <img src={`${API_BASE_URL}/images/${oi.catalog.catalog_image}`} alt="Product" class="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p class="text-[15px] font-medium text-white">{oi.catalog.catalogName}</p>
                                    <p class="text-xs text-white mt-1">Qty: {oi.quantity}</p>
                                </div>
                            </div>
                          ))}
                        </div>

                        
                    </div>

                    
                </div>


                
            </div>
        </div>
      )})}

      {historyOrders.length > 0 && (
      <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getOrderDetails} />
      </div>  
      )}
  </div>


)
}

export default OrderHistory;