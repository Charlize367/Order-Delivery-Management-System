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
    const [deliveryId, setDeliveryId] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState("00:00");
    const [drivers, setDrivers] = useState([]);
  
    
    
    console.log(deliveryDetails);
    const openEditStatusForm = (delivery_ID) => {
    setIsActive(!isActive);
    setDeliveryId(delivery_ID);
    };

    const openEditDriverForm = (delivery_ID) => {
      setIsActive2(!isActive2);
      setDeliveryId(delivery_ID);
    }

    const openEditETAForm = (delivery_ID) => {
      setIsActive3(!isActive3);
      setDeliveryId(delivery_ID);
    }

  const getDeliveryDetails = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/delivery`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

          
          const deliveries = response.data;
         

        
          const sortedDeliveries = deliveries.sort(
      (a, b) => a.delivery_ID - b.delivery_ID
    );

    setDeliveryDetails(sortedDeliveries);
          
          } catch {
            console.error("Error");
            
          
          }
  }

  useEffect(() => {
        getDeliveryDetails();
    }, []);


  
    const getDriver = async () => {
      try {
        const response = await axios.get(`http://localhost:8083/users/role/DELIVERY`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

              setDrivers(response.data);
      } catch {
        console.log("Error");
      }
    }

    useEffect(() => {
      getDriver();

    }, [])



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
      setSelectedDriverId(null);
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



      
     
        const handleSubmit2 = async(e) => {
         e.preventDefault();
          console.log("Selected status:", status);
        try {
    


        const response = await axios.put(`http://localhost:8083/delivery/${deliveryId}/drivers/${selectedDriverId}`, {}, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDriver(response.data);
          
     getDeliveryDetails();
      
        }
        catch{
          console.log("Failed to Update Status")
          
        }
      }




      const handleChange3 = (e) => {
          setEstimatedTime(e.target.value); 
        };



      const putData2 = {
        estimated_time: estimatedTime
      }

     
        const handleSubmit3 = async(e) => {
         e.preventDefault();
          
        try {

        const response = await axios.put(`http://localhost:8083/delivery/estimatedTime/${deliveryId}`, putData2 , {
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
      
      <div className="delivery-list-table">
        
          <table className="adminDeliveryTable">
            <thead>
            <tr>
              <th className="delivery-th">Delivery ID</th>
              <th className="delivery-th">Driver</th>
              <th className="delivery-th">Date</th>
              <th className="delivery-th">Status</th>
              <th className="delivery-th">Address</th>
              <th className="delivery-th">Estimated Time</th>
              <th className="delivery-th">Delivered Time</th>
      
            </tr>
            </thead>
            {deliveryDetails.map((d) => {

             
      
      let deliveryDriver = "";
      if(d.deliveryMen === null) deliveryDriver = "Add Driver";
      else if(d.deliveryMen != null) deliveryDriver = d.deliveryMen.username;

      let ETA = "";
      if(d.estimated_time === null) ETA = "Add ETA";
      else if(d.estimated_time != null) ETA = d.estimated_time;

      let delTime = "";
      if(d.delivered_time === null) delTime = "Not yet delivered";
      else if(d.delivered_time != null) delTime = d.delivered_time;


      
      
      return(
            <tbody>
              
              <tr key={d.delivery_ID}>
                <td>{d.delivery_ID}</td>
                <td><button className="updateBtn" onClick={() => openEditDriverForm(d.delivery_ID)}>{deliveryDriver}</button></td>
                <td>{d.orders.order_date}</td>
                <td><button className="updateBtn" onClick={() => openEditStatusForm(d.delivery_ID)}>{d.delivery_status}</button></td>
                <td>{d.address}</td>
                <td><button className="updateBtn" onClick={() => openEditETAForm(d.delivery_ID)}>{ETA}</button></td>
                <td>{delTime}</td>

                
                
            </tr>
          
            </tbody>
             )})}
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
              <button className="closeBtn4" onClick={openEditDriverForm}>x</button>
              <h2>Assign a Driver</h2>
               <form method="post" onSubmit={handleSubmit2} className="orStatusForm">
              <select id="driver" value={selectedDriverId} onChange={handleChange2} className="selectOrderStatus">
                <option value="">Assign a driver...</option>
                {drivers.map(dd => (
                <option key={dd.userId} value={dd.userId}>{dd.username}</option>
                ))}
              </select>
              <button type="submit" className="submitOrderStatusBtn" >Assign</button>
              </form>
              </div>

               <div className="editOrderStatusForm" style={isActive3 ? {display: "flex"} : {display: "none"}}>
              <button className="closeBtn4" onClick={openEditETAForm}>x</button>
              <h2>Edit Delivery Status </h2>
               <form method="post" onSubmit={handleSubmit3} className="orStatusForm">
                <p>Select ETA:</p>
                <input type="time" id="eta" name="estimatedTime" value={estimatedTime} onChange={handleChange3}/>
              <button type="submit" className="submitOrderStatusBtn">Select</button>
              </form>
              </div>


          </div>
     
    </div>
    
  )
}
        

export default Deliveries