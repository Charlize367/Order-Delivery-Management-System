import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const Orders = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const [orderId, setOrderID] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [orderItems, setOrderItems] = useState([]);
  const [orderPrice, setOrderPrice] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(0);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  console.log(selectedOrder);
  console.log(orderItems);

  const openOrders = (orderId, orders) => {
    setIsActive(!isActive);
    setSelectedOrder(orderId);
    setOrderPrice(orders);
  };

  


  const getOrderDetails = async (page = 0) => {
    try {
            const response = await axios.get(`${API_URL}/delivery?page=${page}&size=${pageSize}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          
          console.log(response.data.content);
          const deliveries = response.data.content;

        
          const sortedOrders = deliveries.sort(
      (a, b) => a.order.orderId - b.order.orderId
    );

          setOrderDetails(sortedOrders);
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


    const getOrderItemsByOrder = async() => {
      try {

        const response = await axios.get(`${API_URL}/orderItems/orders/${selectedOrder}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    setOrderItems(response.data);
      } catch (error) {
        console.log("Error");
        if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
            }
      }
    }


    useEffect(() => {
        getOrderItemsByOrder();
    }, [selectedOrder]);
    
        const handleChange = (e) => {
          setStatus(e.target.value); 
        };

        const handleSubmit = async(orderId, status) => {
         
          const putData = {
        order_status: status

      }

          console.log("Selected status:", status);
        try {
    


        const response = await axios.put(`${API_URL}/orders/orderStatus/${orderId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setOrderDetails(or =>
          or.map(orders =>
            orders.order.orderId === orderId
              ? { ...orders, orders : {...orders.orders, order_status: status}
          }
            : orders
        )

            );
      getOrderDetails();
      console.log(putData);
        }
        catch (error) {
          console.log("Failed to Update Status")
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
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-6">
        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="bg-[#232323] text-gray-200 border-b border-[#2f2f2f]">
            <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white">
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Order ID</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Customer</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Date Ordered</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Status</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Address</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Order</th>
      
            </tr>
            </thead>
            {orderDetails.map((or) => {
             
            
              
          return(
            <tbody className="bg-[#1f1f1f]">
              
              <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white"  key={or.order.orderId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{or.order.orderId}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{or.order.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{new Date(or.order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">
                  
                  <select
                    value={or.order.order_status}
                    onChange={(e) =>
                    handleSubmit(or.order.orderId, e.target.value)
                    }
                    className="bg-[#232323] text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="On the Way">On the Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    
                </select>
                  </td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{or.address}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300"><button className="viewOrderItems" onClick={() => openOrders(or.order.orderId, or.orders)}>View Order</button></td>
                
            </tr>
          
            </tbody>
            )})}
            </table>

            <div
  className={`fixed top-0 right-0 w-96 h-screen bg-[#2a2a2a] text-white shadow-2xl p-6 flex flex-col z-50 transition-transform ${
    isActive ? "translate-x-0" : "translate-x-full"
  }`}
>
  
  <button
    className="self-end  cursor-pointer hover:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition"
    onClick={openOrders}
  >
    ×
  </button>

  <h2 className="text-2xl font-bold mt-2 mb-4">Order Items</h2>

  
  <ul className="flex-1 flex flex-col gap-4 overflow-y-auto">
    {orderItems.map((oi) => (
      <li
        key={oi.catalog.id}
        className="flex gap-4 p-4 bg-[#1f1f1f] rounded-lg shadow hover:shadow-lg transition items-center"
      >
        <img
          className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
          src={`https://${bucket}.s3.${region}.amazonaws.com/${oi.catalog.catalog_image}`}
          alt={oi.catalog.catalogName}
        />
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-white text-lg">{oi.catalog.catalogName}</p>
            <p className="text-white text-sm">Price: PHP {oi.catalog.catalog_price}</p>
            <p className="text-white text-sm">Quantity: {oi.quantity}</p>
          </div>
          <p className="mt-2 font-bold text-white">Subtotal: PHP {oi.subtotal}</p>
        </div>
      </li>
    ))}
  </ul>


  {orderPrice && (
    <div className="mt-4 pt-4 border-t border-green-500 flex justify-between items-center font-bold text-xl text-white">
      <p>Total:</p>
      <p>PHP {orderPrice.order_price}</p>
    </div>
  )}

 
</div>

            
        
    </div>

    {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getOrderDetails} currentPage={currentPage} />
    )}

    {!isLoading && orderDetails.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no orders found.</p>
    )}

    {orderDetails.length > 0 && (
   <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getOrderDetails} />
          </div>  
    )}
    </div>
  )
}

export default Orders