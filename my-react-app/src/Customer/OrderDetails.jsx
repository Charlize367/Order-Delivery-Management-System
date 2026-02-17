import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation} from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';


const OrderDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderId] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelId, setCancelId] = useState(0);

  const handleCancelClick = (id) => {
        setShowCancelConfirm(!showCancelConfirm); 
        setCancelId(id);
     };

  useEffect(() => {
    if (location.state?.showPopup) {
      setShowPopup(true);

      
      const timer = setTimeout(() => setShowPopup(false), 3000);
      
    }
  }, [location.state]);


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

    console.log(response);
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

      const ongoingOrders = orderDetails.filter(or => getMergedStatus(or) === "Ongoing");
  
    

      const cancelOrder = async (e) => {
        e.preventDefault();
         try {

        const putData = {
          order_status: 'Cancelled'
        }

        const response = await axios.put(`${API_URL}/orders/orderStatus/${cancelId}`, putData , {
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
        catch (error) {
          console.log("Failed to Update Status");
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
        }
      }
      
   


  return (
    <div className="body">
      <Header />
      <h1 className="text-white text-4xl font-bold m-10">My Orders</h1>

       {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getOrderDetails} currentPage={currentPage} />
        )}

        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}
      
      
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
      if (or.order.order_status === "Order Placed") mergedStatus = "Order Placed";
      else if (or.order.order_status === "Preparing" || or.order.order_status === "Confirmed"  ) mergedStatus = "Preparing";
      else if (or.delivery_status === "Driver Assigned" || or.delivery_status === "On the Way") mergedStatus = "On the Way";
      else if (or.order.order_status === "Completed" || or.delivery_status === "Delivered") mergedStatus = "Delivered";
       

   
     
     

      return (


<div class="p-4">
  
          <div class="max-w-6xl bg-[#232323] p-10 rounded-2xl mx-auto text-white">
              <div>
                  <h1 class="text-2xl font-semibold text-white">Order Summary</h1>
                  <p class="text-sm text-gray-200 mt-3">Your purchase was successful. Here’s a summary of your order details.</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-gray-300 pb-2 mt-12">
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-white text-xs font-medium">Delivery Date</p>
                          <h6 class="text-base font-medium text-white">{new Date(or.order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</h6>
                      </div>
                      <div>
                          <p class="mb-2 uppercase tracking-wide text-white text-xs font-medium">Order ID</p>
                          <h6 class="text-base font-medium text-white">#{or.order.orderId}</h6>
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

             
<div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

 
  <div className="lg:col-span-2 space-y-6">
    {or.orderItems.map((oi) => (
      <div key={oi.catalog.catalogId} className="bg-[#2a2a2a] p-4 rounded-md">
        <div className="grid sm:grid-cols-3 items-center gap-4">
          
          <div className="col-span-2 flex items-center gap-4">
            <div className="w-28 h-28 bg-gray-100 p-2 rounded-md">
              <img
                src={`https://${bucket}.s3.${region}.amazonaws.com/${oi.catalog.catalog_image}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="sm:text-base text-sm font-semibold text-white">
                {oi.catalog.catalogName}
              </h3>
              <p className="text-xs text-gray-200 mt-1">
                Qty: {oi.quantity}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto">
            <h4 className="sm:text-lg text-base font-semibold text-white">
              PHP {oi.subtotal}
            </h4>
          </div>
        </div>

        <hr className="border-gray-300 my-3" />
      </div>
    ))}
  </div>


  <div className="space-y-6">

    
    <div className="bg-[#202020] border border-[#232323] rounded-md p-6">
      <h3 className="text-lg font-semibold text-white border-b border-gray-300 pb-2">
        Billing details
      </h3>

      <ul className="mt-4 text-sm font-medium text-white space-y-4">
        <li className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold">PHP {or.order.order_price}</span>
        </li>
      </ul>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => handleCancelClick(or.order.orderId)}
          className="w-full text-sm cursor-pointer px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700"
        >
          Cancel Order
        </button>

        <button onClick={() => navigate('/browse')}
          className="w-full cursor-pointer text-sm px-4 py-2 bg-transparent text-white border border-gray-300 rounded-md hover:bg-gray-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>

    
    <div className="bg-[#202020] border border-[#232323] rounded-md p-6">
      <h3 className="text-lg font-semibold text-white border-b border-gray-300 pb-2">
        Delivery Details
      </h3>

      <ul className="mt-4 text-sm font-medium text-white space-y-3">
        <li className="flex justify-between">
          <span>Estimated Time</span>
          <span className="font-semibold">
            {!or.estimated_time
              ? "Pending"
              : new Date(`1970-01-01T${or.estimated_time}Z`).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
          </span>
        </li>

        <li className="flex justify-between">
          <span>Delivered Time</span>
          <span className="font-semibold">
            {!or.delivered_time
              ? "Not delivered yet"
              : new Date(`1970-01-01T${or.delivered_time}Z`).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
          </span>
        </li>

        <li className="flex justify-between">
          <span>Assigned Driver</span>
          <span className="font-semibold">
            {or.deliveryMen?.username || "No driver assigned"}
          </span>
        </li>
      </ul>
    </div>

  </div>

</div>

          </div>
      </div>
      )})}

      {showCancelConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-xs rounded-lg bg-[#1e1e1e] px-6 py-5 text-gray-200 text-center shadow-lg">
      
      <h2 className="text-base font-semibold mb-2">Confirm Delete</h2>
      <p className="text-sm text-gray-400 mb-4">
        Are you sure you want to cancel your order?
      </p>

      <div className="space-y-2">
        <button
          onClick={cancelOrder}
          className="w-full cursor-pointer rounded-md bg-gradient-to-r from-[#56C789] to-[#096E22] py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Yes, Cancel My Order
        </button>

        <button
          onClick={handleCancelClick}
          className="w-full cursor-pointer rounded-md border border-[#56C789] py-2 text-sm text-[#56C789] hover:bg-[#56C789]/10 transition"
        >
          No
        </button>
      </div>

    </div>
  </div>
)}

      {!isLoading && ongoingOrders.length == 0 && (
            <p className="flex justify-center text-white text-lg">You have no pending orders.</p>
          )}
      
      {ongoingOrders.length > 0 && (
      <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getOrderDetails} />
      </div>  
      )}
  </div>
    
      
  
  )
}

export default OrderDetails