import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Deliveries = () => {
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [order_ID, setOrderID] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isActive2, setIsActive2] = useState(false);
    const [isActive3, setIsActive3] = useState(false);
    const [status, setStatus] = useState("");
    const [driver, setDriver] = useState("");
    const [selectedDriverId, setSelectedDriverId] = useState(0);
    
    
    console.log(deliveryDetails);
    const openEditStatusForm = () => {
    setIsActive(!isActive);
    };

    const openEditDriverForm = () => {
      setIsActive2(!isActive2);
    }

    const openEditETAForm = () => {
      setIsActive3(!isActive3);
    }

  const getDeliveryDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery/users/customer/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


        
          
        
          
          const response2 = await axios.get(`http://localhost:8083/users/role/DELIVERY`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          const deliveries = response.data;
         

          const combinedArray = deliveries.map(delivery => ({
            ...delivery,
            drivers:response2.data
          }))
          setDeliveryDetails(combinedArray);
          
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
        const handleSubmit = async(delivery_ID) => {
         
          console.log("Selected status:", status);
        try {

        const response = await axios.put(`http://localhost:8083/delivery/deliveryStatus/${delivery_ID}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.delivery_ID === delivery_ID
              ? { ...dd, delivery_status:response.data.delivery_status
          }
            : dd
        
        )

            );
          
      getDeliveryDetails();
      console.log(putData);
        }
        catch{
          console.log("Failed to Update Status")
          console.log(driver);
          
        }
      }









      const handleChange2 = (e) => {
          setSelectedDriverId(e.target.value); 
        };



      
     
        const handleSubmit2 = async(delivery_ID) => {
         
          console.log("Selected status:", status);
        try {
    


        const response = await axios.put(`http://localhost:8083/delivery/${delivery_ID}/drivers/${selectedDriverId}`, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.dd.delivery_ID === delivery_ID
              ? { ...dd, deliveryMen:response.data.deliveryMen
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
          
  
  return (
    <div className="body">
      <Header />
      {deliveryDetails.map((d) => {
      
      let deliveryDriver = "";
      if(d.deliveryMen === null) deliveryDriver = "Add Driver";
      else if(d.deliveryMen != null) deliveryDriver = d.deliveryMen;

      let ETA = "";
      if(d.estimated_time === null) ETA = "Add ETA";
      else if(d.estimated_time != null) ETA = d.estimated_time;
      
      return(
      <div className="delivery-list-table">
        
          <table className="adminDeliveryTable">
            <thead>
            <tr>
              <th >Delivery ID</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Status</th>
              <th>Address</th>
              <th>Estimated Time</th>
              <th>Delivered Time</th>
      
            </tr>
            </thead>
            <tbody>
              
              <tr key={d.delivery_ID}>
                <td>{d.delivery_ID}</td>
                <td><button className="updateBtn" onClick={() => openEditDriverForm(d.delivery_ID)}>{deliveryDriver}</button></td>
                <td>{d.orders.order_date}</td>
                <td><button className="updateBtn" onClick={openEditStatusForm}>{d.delivery_status}</button></td>
                <td>{d.address}</td>
                <td><button className="updateBtn" onClick={openEditETAForm}>{ETA}</button></td>
                <td>{d.delivered_time}</td>
                
            </tr>
          
            </tbody>
            </table>

            <div className="editOrderStatusForm" style={isActive ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditStatusForm}>x</button>
              <h2>Edit Delivery Status Status</h2>
               <form onSubmit={handleSubmit} className="orStatusForm">
              <select id="status" value={status} onChange={handleChange} className="selectOrderStatus">
                <option value="">Update Status...</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Driver Assigned">Driver Assigned</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button type="submit" className="submitOrderStatusBtn" onClick={() => handleSubmit(d.delivery_ID)}>Update</button>
              </form>
              </div>


              <div className="editOrderStatusForm" style={isActive2 ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditDriverForm}>x</button>
              <h2>Assign a Driver</h2>
               <form onSubmit={handleSubmit2} className="orStatusForm">
              <select id="driver" value={driver} onChange={handleChange2} className="selectOrderStatus">
                <option value="">Assign a driver...</option>
                {d.drivers.map(dd => (
                <option key={dd.userId} value={dd.userId}>{dd.username}</option>
                ))}
              </select>
              <button type="submit" className="submitOrderStatusBtn" onClick={() => handleSubmit2(d.delivery_ID)}>Assign</button>
              </form>
              </div>


          </div>
      )})}
    </div>
    
  )
}
        

export default Deliveries