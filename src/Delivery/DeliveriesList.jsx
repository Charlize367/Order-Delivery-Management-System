import React from 'react'
import Header from '../components/DeliveryHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';


const DeliveriesList = () => {
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isActive2, setIsActive2] = useState(false);
    const [isActive3, setIsActive3] = useState(false);
    const [status, setStatus] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("00:00");
    const [deliveredTime, setDeliveredTime] = useState("00:00");
    const [orderID, setOrderID] = useState(0);
    const [deliveryId, setDeliveryId] = useState(0);
    const [orderItems, setOrderItems] = useState()


    console.log(user_ID);
    const openEditStatusForm = (delivery_ID) => {
    setIsActive(!isActive);
    setDeliveryId(delivery_ID)
    };

    const openEditDelTimeForm = (delivery_ID) => {
      setIsActive2(!isActive2);
      setDeliveryId(delivery_ID);
      
    }

    const openEditETAForm = (delivery_ID) => {
      setIsActive3(!isActive3);
      setDeliveryId(delivery_ID);
    }



    const getDeliveryDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery/users/delivery/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          const deliveries = response.data;
          const deliveryWithOrderItems = await Promise.all(
            deliveries.map(async (delivery) => {
              const orderId = delivery.orders.order_ID;

              const response2 = await axios.get(`http://localhost:8083/orderItems/orders/${orderId}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
           
          return {
            ...delivery,
            orderItems:response2.data
          }
           })
          )

          setDeliveryDetails(deliveryWithOrderItems);
          } catch {
            console.error("Error");
            
          
          }
  }

  useEffect(() => {
        getDeliveryDetails();
    }, []);




    const handleChange = (e) => {
          setStatus(e.target.value); 
        };



      const putData = {
        delivery_status: status
      }

     console.log(status);
        const handleSubmit = async(e) => {
         e.preventDefault();
          console.log("Selected status:", status);
        try {

        const response = await axios.put(`http://localhost:8083/delivery/deliveryStatus/${deliveryId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.delivery_ID === deliveryId
              ? { ...dd, delivery_status:response.data.delivery_status
          }
            : dd
        
        )

            );
          
      getDeliveryDetails();
    
        }
        catch{
          console.log("Failed to Update Status")
         
          
        }
      }

      const handleChange2 = (e) => {
          setDeliveredTime(e.target.value); 
        };



      const putData2 = {
        delivered_time: deliveredTime
      }

     
        const handleSubmit2 = async(e) => {
         e.preventDefault();
          
        try {

        const response = await axios.put(`http://localhost:8083/delivery/deliveredTime/${deliveryId}`, putData2 , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.delivery_ID === deliveryId
              ? { ...dd, delivered_time:response.data.delivered_time
          }
            : dd
        
        )

            );
          
      getDeliveryDetails();
     
        }
        catch{
          console.log("Failed to Update Time")
          
          
        }
      }


      const handleChange3 = (e) => {
          setEstimatedTime(e.target.value); 
        };



      const putData3 = {
        estimated_time: estimatedTime
      }

     
        const handleSubmit3 = async(e) => {
         e.preventDefault();
          
        try {

        const response = await axios.put(`http://localhost:8083/delivery/estimatedTime/${deliveryId}`, putData3 , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.delivery_ID === deliveryId
              ? { ...dd, estimated_time:response.data.estimated_time
          }
            : dd
        
        )

            );
          
      getDeliveryDetails();
     
        }
        catch{
          console.log("Failed to Update Time")
          
          
        }
      }


  return (
    <div className="body">
      <Header />
      {deliveryDetails.map((d) => {

      let ETA = "";
      if(d.estimated_time === null) ETA = "Add ETA";
      else if(d.estimated_time != null) ETA = d.estimated_time;

      let delTime = "";
      if(d.delivered_time === null) delTime = "Not yet delivered";
      else if(d.delivered_time != null) delTime = d.delivered_time;

      return(
      <div className="delivery-list-table">
        
          <table className="delivery-list-table-table">
            <thead>
            <tr>
              <th className="delivery-list-th">Delivery ID</th>
              <th className="delivery-list-th">Customer</th>
              <th className="delivery-list-th">Order Items</th>
              <th className="delivery-list-th">Date</th>
              <th className="delivery-list-th">Status</th>
              <th className="delivery-list-th">Address</th>
              <th className="delivery-list-th">Estimated Time</th>
              <th className="delivery-list-th">Delivered Time</th>
      
            </tr>
            </thead>
            <tbody>

              <tr key={d.delivery_ID}>
                <td>{d.delivery_ID}</td>
                <td> {d.orders.customer.username}</td>
                {d.orderItems.map(oi => (
                  <td className="order-items-td">
                    <li className="td-oi">
                    <p>{oi.order_catalog.catalogName} ({oi.quantity})</p>
                    
                    </li>
                  </td>
                ))}
                <td>{d.orders.order_date}</td>
                <td><button className="updateBtn" onClick={() => openEditStatusForm(d.delivery_ID)}>{d.delivery_status}</button></td>
                <td>{d.address}</td>
                <td><button className="updateBtn" onClick={() => openEditETAForm(d.delivery_ID)}>{ETA}</button></td>
                <td><button className="updateBtn" onClick={() => openEditDelTimeForm(d.delivery_ID)}>{delTime}</button></td>
                </tr>
            </tbody>
            </table>

            <div className="editOrderStatusForm" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditStatusForm}>x</button>
              <h2>Edit Delivery Status </h2>
               <form method="post" onSubmit={handleSubmit} className="orStatusForm">
              <select id="status" value={status} onChange={handleChange} className="selectOrderStatus">
                <option value="">Update Status...</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Driver Assigned">Driver Assigned</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button type="submit" className="submitOrderStatusBtn">Update</button>
              </form>
              </div>

              <div className="editOrderStatusForm" style={isActive2 ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditDelTimeForm}>x</button>
              <h2>Edit Delivery Time </h2>
               <form method="post" onSubmit={handleSubmit2} className="orStatusForm">
                <p>Select Delivered Time:</p>
                <input type="time" id="delTime" name="deliveredTime" value={deliveredTime} onChange={handleChange2}/>
              <button type="submit" className="submitOrderStatusBtn">Select</button>
              </form>
              </div>

              <div className="editOrderStatusForm" style={isActive3 ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditETAForm}>x</button>
              <h2>Select Estimated Time </h2>
               <form method="post" onSubmit={handleSubmit3} className="orStatusForm">
                <p>Select ETA:</p>
                <input type="time" id="eta" name="estimatedTime" value={estimatedTime} onChange={handleChange3}/>
              <button type="submit" className="submitOrderStatusBtn">Select</button>
              </form>
              </div>
      
    </div>

      )})}
    </div>
  )
}

export default DeliveriesList