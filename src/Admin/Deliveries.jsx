import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Deliveries = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('jwtToken');
    const [deliveryDetails, setDeliveryDetails] = useState([]);
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
    const openEditStatusForm = (deliveryId) => {
    setIsActive(!isActive);
    setDeliveryId(deliveryId);
    };

    const openEditDriverForm = (deliveryId) => {
      setIsActive2(!isActive2);
      setDeliveryId(deliveryId);
    }

    const openEditETAForm = (deliveryId) => {
      setIsActive3(!isActive3);
      setDeliveryId(deliveryId);
    }

  const getDeliveryDetails = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/delivery`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

          
          const deliveries = response.data;
         

        
          const sortedDeliveries = deliveries.sort(
      (a, b) => a.deliveryId - b.deliveryId
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
        const response = await axios.get(`${API_BASE_URL}/users/role/DELIVERY`, {
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

     
        const handleSubmit = async(deliveryId, status ) => {
        
          const putData = {
        delivery_status: status
      }
          console.log("Selected status:", status);
        try {

        const response = await axios.put(`${API_BASE_URL}/delivery/deliveryStatus/${deliveryId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.deliveryId === deliveryId
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

     
        const handleSubmit2 = async(deliveryId, driverId) => {
       
         
          console.log("Selected status:", status);
        try {
    


        const response = await axios.put(`${API_BASE_URL}/delivery/${deliveryId}/drivers/${driverId}`, {}, {
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


     
        const handleSubmit3 = async(deliveryId, estimatedTime ) => {
         
        const putData = {
        estimated_time: estimatedTime
      }
        try {

        const response = await axios.put(`${API_BASE_URL}/delivery/estimatedTime/${deliveryId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.deliveryId === deliveryId
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
      
       <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white">
              <th scope="col" className="px-6 py-3">Delivery ID</th>
              <th scope="col" className="px-6 py-3">Driver</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Estimated Time</th>
              <th scope="col" className="px-6 py-3">Delivered Time</th>
      
            </tr>
            </thead>
            {deliveryDetails.map((d) => {

             
      
      let deliveryDriver = "";
      if(d.deliveryMen === null) deliveryDriver = "Add Driver";
      else if(d.deliveryMen != null) deliveryDriver = d.deliveryMen.username;

      let ETA = "";
      if (!d.estimated_time) {
        ETA = "Add ETA";
      } else {
        const [hours, minutes, seconds] = d.estimated_time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        ETA = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
      }


      let delTime = "";
      if (!d.delivered_time) {
        delTime = "Not delivered yet";
      } else {
        const [hours, minutes, seconds] = d.delivered_time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        delTime = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
      }

      console.log(selectedDriverId);

      
      
      return(
            <tbody>
              
              <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white" key={d.deliveryId}>
                <td className="px-6 py-4 max-w-xs break-words">{d.deliveryId}</td>
                <td className="px-6 py-4 max-w-xs break-words">
                  <select id="driver" value={d.deliveryMen ? d.deliveryMen.userId : ""} onChange={(e) =>
                  
                    handleSubmit2(d.deliveryId, e.target.value)
                    } className="selectOrderStatus">
                <option value="">Assign a driver...</option>
                {drivers.map(dd => (
                <option key={dd.userId} value={dd.userId}>{dd.username}</option>
                ))}
              </select></td>
                <td className="px-6 py-4 max-w-xs break-words">{d.orders.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words">{new Date(d.orders.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words">
                  <select id="driver" value={d.delivery_status ? d.delivery_status : ""} onChange={(e) =>
                  
                    handleSubmit(d.deliveryId, e.target.value)
                    } className="selectOrderStatus">
                <option value="">Update Status...</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Driver Assigned">Driver Assigned</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              
              </select></td>
                <td className="px-6 py-4 max-w-xs break-words">{d.address}</td>
                <td className="px-6 py-4 max-w-xs break-words"><input type="time" id="eta" name="estimatedTime" value={d.estimated_time} onChange={(e) =>
                    handleSubmit3(d.deliveryId, e.target.value)
                    }/></td>
                <td className="px-6 py-4 max-w-xs break-words">{delTime}</td>

                
                
            </tr>
          
            </tbody>
             )})}
            </table>

           

          </div>
     
    </div>
    
  )
}
        

export default Deliveries