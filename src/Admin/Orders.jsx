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
  const [orderItems, setOrderItems] = useState([]);
  const [orderPrice, setOrderPrice] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(0);
  


  console.log(selectedOrder);
  console.log(orderItems);

  const openOrders = (order_ID, orders) => {
    setIsActive(!isActive);
    setSelectedOrder(order_ID);
    setOrderPrice(orders);
  };

  const openEditStatusForm = (order_ID) => {
    setIsActive2(!isActive2);
    setOrderID(order_ID);
  };


  const getOrderDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          
          const deliveries = response.data;

        
          const sortedOrders = deliveries.sort(
      (a, b) => a.orders.order_ID - b.orders.order_ID
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

        const response = await axios.get(`http://localhost:8083/orderItems/orders/${selectedOrder}`, {
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


      



      const putData = {
        order_status: status
      }

      console.log(putData);
        const handleSubmit = async() => {
         
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
      
      <div className="orders-list-table">
        
          <table className="adminOrderTable">
            <thead>
            <tr>
              <th className="order-th">Order ID</th>
              <th className="order-th">Customer</th>
              <th className="order-th">Date Ordered</th>
              <th className="order-th">Status</th>
              <th className="order-th">Address</th>
              <th className="order-th">Order</th>
      
            </tr>
            </thead>
            {orderDetails.map((or) => {
             
            
              
          return(
            <tbody>
              
              <tr key={or.orders.order_ID}>
                <td>{or.orders.order_ID}</td>
                <td>{or.orders.customer.username}</td>
                <td>{new Date(or.orders.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td><button className="updateBtn" onClick={() => openEditStatusForm(or.orders.order_ID)}>{or.orders.order_status}</button></td>
                <td>{or.address}</td>
                <td><button className="viewOrderItems" onClick={() => openOrders(or.orders.order_ID, or.orders)}>View Order</button></td>
                
            </tr>
          
            </tbody>
            )})}
            </table>

            <div className="ordersView" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn5" onClick={openOrders}>x</button>
              <ul>
                 {orderItems.map(oi => (
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
              {orderPrice && (
                <>
              <p className="order-summary-total-txt">Total:</p>
                    <p className="order-summary-total-amount-txt"> PHP {orderPrice.order_price}</p></>
              )}
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

              <button type="submit" className="submitOrderStatusBtn" onClick={handleSubmit}>Update</button>
              </form>
              </div>  
              
    </div>
   
    </div>
  )
}

export default Orders