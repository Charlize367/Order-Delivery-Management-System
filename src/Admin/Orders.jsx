import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Orders = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [orderDetails, setOrderDetails] = useState([]);
  const [order_ID, setOrderID] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [status, setStatus] = useState("");


  

  const openOrders = () => {
    setIsActive(!isActive);
  };

  const openEditStatusForm = () => {
    setIsActive2(!isActive2);
  };


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


        const handleChange = (e) => {
          setStatus(e.target.value); 
        };



      const putData = {
        order_status: status
      }

      console.log(putData);
        const handleSubmit = async(order_ID) => {
         
          console.log("Selected status:", status);
        try {
    


        const response = await axios.put(`http://localhost:8083/orders/orderStatus/${order_ID}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setOrderDetails(or =>
          or.map(orders =>
            orders.orders.order_ID === order_ID
              ? { ...orders, orders : {...orders.orders, order_status: response.data.orders.order_status}
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
      {orderDetails.map(or => (
      <div className="orders-list-table">
        
          <table className="adminOrderTable">
            <thead>
            <tr>
              <th className="order-th">Order ID</th>
              <th>Customer</th>
              <th>Date Ordered</th>
              <th>Status</th>
              <th>Address</th>
              <th>Order</th>
      
            </tr>
            </thead>
            <tbody>
              
              <tr key={or.orders.order_ID}>
                <td>{or.orders.order_ID}</td>
                <td>{or.orders.customer.username}</td>
                <td>{or.orders.order_date}</td>
                <td><button className="updateBtn" onClick={openEditStatusForm}>{or.orders.order_status}</button></td>
                <td>{or.address}</td>
                <td><button className="viewOrderItems" onClick={openOrders}>View Order</button></td>
                
            </tr>
          
            </tbody>
            </table>

            <div className="ordersView" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn3" onClick={openOrders}>x</button>
              <ul>
                 {or.orderItems.map(oi => (
              <li className="order-summary-details-div">
                <img className="order-summary-img" src={`http://localhost:8083/images/${oi.order_catalog.catalog_image}`}/>
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
              <p className="order-summary-total-txt">Total:</p>
                    <p className="order-summary-total-amount-txt"> PHP {or.orders.order_price}</p>
            </div>


            <div className="editOrderStatusForm" style={isActive2 ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditStatusForm}>x</button>
              <h2>Edit Order Status</h2>
               <form onSubmit={handleSubmit} className="orStatusForm">
              <select id="status" value={status} onChange={handleChange} className="selectOrderStatus">
                <option value="">Update Status...</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Preparing">Preparing</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button type="submit" className="submitOrderStatusBtn" onClick={() => handleSubmit(or.orders.order_ID)}>Update</button>
              </form>
              </div>  
             
    </div>
    ))} 
    </div>
  )
}

export default Orders