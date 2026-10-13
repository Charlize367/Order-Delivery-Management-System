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

        try {



        const response = await axios.put(`${API_URL}/orders/orderStatus/${orderId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

         setOrderDetails(or =>
          or.map(orders =>
            orders.order.orderId === orderId
              ? { ...orders, orders : {...orders.orders, order_status: status}
          }
            : orders
        )

            );
      getOrderDetails();
        }
        catch (error) {
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);

            }
        }
      }

  const statusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-[#8A9A5B]/15 text-[#5b6a3a] border-[#8A9A5B]/40";
      case "Cancelled":
        return "bg-[#3B2A20]/10 text-[#3B2A20]/70 border-[#3B2A20]/20";
      case "On the Way":
        return "bg-[#A65A34]/15 text-[#A65A34] border-[#A65A34]/40";
      default:
        return "bg-white text-[#3B2A20] border-[#A65A34]/30";
    }
  };


  return (
    <div className="body bg-[#F7F1E8] min-h-screen pb-16">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-[#3B2A20]">Orders</h1>
        <p className="text-sm text-[#3B2A20]/60 mt-1">Review and update order statuses</p>
      </div>

      <div className="relative overflow-x-auto rounded-xl shadow-md border border-[#A65A34]/10 max-w-7xl mx-auto mt-2 mx-4 sm:mx-6 lg:mx-8">
        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
            </div>
          )}
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="sticky top-0 bg-[#EFE6D8] text-[#3B2A20] border-b border-[#A65A34]/15 z-10">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Order ID</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Customer</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Date Ordered</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Status</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Address</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Order</th>

            </tr>
            </thead>
            {orderDetails.map((or) => {



          return(
            <tbody className="bg-white">

              <tr className="border-b border-[#A65A34]/10 hover:bg-[#FBF8F3] transition-colors duration-150"  key={or.order.orderId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20] font-medium">#{or.order.orderId}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{or.order.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{new Date(or.order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">

                  <select
                    value={or.order.order_status}
                    onChange={(e) =>
                    handleSubmit(or.order.orderId, e.target.value)
                    }
                    className={`text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] p-2.5 border font-medium ${statusBadgeClass(or.order.order_status)}`}
                >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="On the Way">On the Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>

                </select>
                  </td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{or.address}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm"><button className="cursor-pointer text-[#A65A34] font-medium hover:text-[#8A4A2A] transition-colors duration-150 hover:underline" onClick={() => openOrders(or.order.orderId, or.orders)}>View Order</button></td>

            </tr>

            </tbody>
            )})}
            </table>

            <div
  className={`fixed top-0 right-0 w-96 h-screen bg-[#F7F1E8] text-[#3B2A20] shadow-2xl p-6 flex flex-col z-50 transition-transform border-l border-[#A65A34]/15 ${
    isActive ? "translate-x-0" : "translate-x-full"
  }`}
>

  <div className="flex items-center justify-between mb-2">
    <h2 className="text-2xl font-bold">Order Items</h2>
    <button
      className="cursor-pointer hover:bg-[#A65A34]/10 text-[#3B2A20] rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors duration-150"
      onClick={openOrders}
    >
      ×
    </button>
  </div>


  <ul className="flex-1 flex flex-col gap-4 overflow-y-auto mt-2">
    {orderItems.map((oi) => (
      <li
        key={oi.catalog.id}
        className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 items-center border border-[#A65A34]/10"
      >
        <img
          className="w-20 h-20 object-cover rounded-lg border-2 border-[#8A9A5B]"
          src={`https://${bucket}.s3.${region}.amazonaws.com/${oi.catalog.catalog_image}`}
          alt={oi.catalog.catalogName}
        />
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-[#3B2A20] text-lg">{oi.catalog.catalogName}</p>
            <p className="text-[#3B2A20]/70 text-sm">Price: PHP {oi.catalog.catalog_price}</p>
            <p className="text-[#3B2A20]/70 text-sm">Quantity: {oi.quantity}</p>
          </div>
          <p className="mt-2 font-bold text-[#3B2A20]">Subtotal: PHP {oi.subtotal}</p>
        </div>
      </li>
    ))}
  </ul>


  {orderPrice && (
    <div className="mt-4 pt-4 border-t border-[#8A9A5B]/40 flex justify-between items-center font-bold text-xl text-[#3B2A20]">
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
        <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
          <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 2v4H4l1 15h14l1-15h-5V2M9 2h6M9 11h6"/></svg>
          <p className="text-lg">There are no orders found.</p>
        </div>
    )}

    {orderDetails.length > 0 && (
   <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getOrderDetails} />
          </div>
    )}
    </div>
  )
}

export default Orders