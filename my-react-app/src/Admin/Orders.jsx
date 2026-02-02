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
            orders.orders.orderId === orderId
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

            <div className="ordersView" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn5" onClick={openOrders}>x</button>
              <ul>
                 {orderItems.map(oi => (
              <li className="order-summary-details-div">
                <img className="order-summary-img" src={`${API_URL}/images/${oi.catalog.catalog_image}`}/>
                <div className="order-summary-details">
                    <div className="order-summary-division">
                        <p className="order-summary-name">{oi.catalog.catalogName}</p>
                        <p className="order-summary-price">Price: PHP {oi.catalog.catalog_price}</p>
                        <p className="order-summary-quantity">Quantity: {oi.quantity}</p>
                    </div>
                   
                    <p className="order-summary-subtotal">PHP {oi.subtotal}</p>
                  
                   <div className="order-summary-total">
                    
                    
                    </div>
                    
                </div>
                
              </li>
                 ))}
              </ul>
              {orderPrice && (
                <>
              <p className="order-summary-total-txt">Total:</p>
                    <p className="order-summary-total-amount-txt"> PHP {orderPrice.order_price}</p></>
              )}
            </div>
            
        
    </div>

    {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getOrderDetails} currentPage={currentPage} />
    )}

    {orderDetails.length == 0 && (
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