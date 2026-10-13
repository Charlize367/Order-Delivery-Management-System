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
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
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
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
            
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

      const statusBadgeClasses = (status) => {
        if (status === "Cancelled") {
          return "bg-red-100 text-red-700";
        }
        if (status === "Delivered") {
          return "bg-[#8A9A5B]/15 text-[#5C6B3B]";
        }
        return "bg-[#A65A34]/12 text-[#A65A34]";
      };
    

      console.log(orderDetails);
      
  
  return (
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />
      <div className="px-10 py-9">
        <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">Order History</h1>
        <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]"></div>
      </div>

      {!isLoading && historyOrders.length == 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="mb-4 h-14 w-14 text-[#A65A34]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">No order history found</p>
          <p className="mt-1 text-sm text-[#8A7862]">Orders you complete will show up here.</p>
        </div>
      )}

      {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getOrderDetails} currentPage={currentPage} />
      )}

      {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
            </div>
          )}

      {orderDetails.length > 0 && historyOrders.map((or) => {

      let mergedStatus = "";
      if (or.order.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.order.order_status === "Cancelled") mergedStatus = "Cancelled"; 
      else if (or.order.order_status === "Preparing" || or.order.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.order.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
      
     
     

      return (

      
    
    <div key={or.order.orderId} className="px-4 py-4">
            <div className="mx-auto max-w-screen-xl">
                <div className="flex flex-wrap justify-between items-center gap-6">
                    <div className="max-w-96">
                       
                        <p className="text-base text-[#6B5745]">View and manage your past orders</p>
                    </div>
                    
                </div>

                

                <div className="space-y-6 mt-6">
                    <div className="bg-white border border-[#E7DCC9] rounded-xl text-[#3B2A20] overflow-hidden p-6 shadow-sm transition hover:shadow-md">
                        <div className="flex flex-wrap justify-between gap-6">
                            <div className="max-w-96">
                                <div className="flex items-center gap-4">
                                    <span className="text-[15px] font-semibold text-[#3B2A20]">Order {or.order.orderId}</span>
                                    <span className={`px-3 py-1.5 text-xs font-medium rounded-md ${statusBadgeClasses(mergedStatus)}`}>{mergedStatus}</span>
                                </div>
                                <p className="text-[#8A7862] text-sm mt-3">Placed on {or.order.order_date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-[#A65A34]">PHP {or.order.order_price}</p>
                                
                            </div>
                        </div>

                        <hr className="border-[#E7DCC9] my-6" />

                        <div className="flex flex-wrap items-center gap-8">
                          {or.orderItems.map(oi => (
                            <div key={oi.catalog.catalogId} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#FBF6EE] border border-[#E7DCC9] p-1 rounded-md overflow-hidden">
                                    <img src={`https://${bucket}.s3.${region}.amazonaws.com/${oi.catalog.catalog_image}`} alt="Product" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-medium text-[#3B2A20]">{oi.catalog.catalogName}</p>
                                    <p className="text-xs text-[#8A7862] mt-1">Qty: {oi.quantity}</p>
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