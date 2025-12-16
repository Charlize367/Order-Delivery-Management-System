import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Orders = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderId, setOrderID] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [status, setStatus] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderPrice, setOrderPrice] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(0);
  


  console.log(selectedOrder);
  console.log(orderItems);

  const openOrders = (orderId, orders) => {
    setIsActive(!isActive);
    setSelectedOrder(orderId);
    setOrderPrice(orders);
  };

  


  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/delivery`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          
          const deliveries = response.data;

        
          const sortedOrders = deliveries.sort(
      (a, b) => a.orders.orderId - b.orders.orderId
    );

          setOrderDetails(sortedOrders);
          
          
          
          } catch {
            console.error("Error");
            
          
          }
  }

  useEffect(() => {
        getOrderDetails();
    }, []);


    const getOrderItemsByOrder = async() => {
      try {

        const response = await axios.get(`${API_BASE_URL}/orderItems/orders/${selectedOrder}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    setOrderItems(response.data);
      } catch {
        console.log("Error")
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
    


        const response = await axios.put(`${API_BASE_URL}/orders/orderStatus/${orderId}`, putData , {
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
        catch{
          console.log("Failed to Update Status")
          console.log(status);
          console.log(putData);
        }
      }

      
  return (
    <div className="body">
      <Header />
      
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white">
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Date Ordered</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Order</th>
      
            </tr>
            </thead>
            {orderDetails.map((or) => {
             
            
              
          return(
            <tbody>
              
              <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white"  key={or.orders.orderId}>
                <td className="px-6 py-4 max-w-xs break-words">{or.orders.orderId}</td>
                <td className="px-6 py-4 max-w-xs break-words">{or.orders.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words">{new Date(or.orders.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words">
                  
                  <select
                    value={or.orders.order_status}
                    onChange={(e) =>
                    handleSubmit(or.orders.orderId, e.target.value)
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="On the Way">On the Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    
                </select>
                  </td>
                <td className="px-6 py-4 max-w-xs break-words">{or.address}</td>
                <td className="px-6 py-4 max-w-xs break-words"><button className="viewOrderItems" onClick={() => openOrders(or.orders.orderId, or.orders)}>View Order</button></td>
                
            </tr>
          
            </tbody>
            )})}
            </table>

            <div className="ordersView" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn5" onClick={openOrders}>x</button>
              <ul>
                 {orderItems.map(oi => (
              <li className="order-summary-details-div">
                <img className="order-summary-img" src={`${API_BASE_URL}/images/${oi.order_catalog.catalog_image}`}/>
                <div className="order-summary-details">
                    <div className="order-summary-division">
                        <p className="order-summary-name">{oi.order_catalog.catalogName}</p>
                        <p className="order-summary-price">Price: PHP {oi.order_catalog.catalog_price}</p>
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
   
    </div>
  )
}

export default Orders