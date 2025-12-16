import React from 'react'
import Header from '../components/DeliveryHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';


const DeliveriesList = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isActive2, setIsActive2] = useState(false);
    const [isActive3, setIsActive3] = useState(false);
    const [status, setStatus] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("00:00");
    const [deliveredTime, setDeliveredTime] = useState("00:00");
    const [orderId, setOrderId] = useState(0);
    const [deliveryId, setDeliveryId] = useState(0);
    const [orderItems, setOrderItems] = useState()


    console.log(user_ID);
    const openEditStatusForm = (deliveryId) => {
    setIsActive(!isActive);
    setDeliveryId(deliveryId)
    };

    const openEditDelTimeForm = (deliveryId) => {
      setIsActive2(!isActive2);
      setDeliveryId(deliveryId);
      
    }

    const openEditETAForm = (deliveryId) => {
      setIsActive3(!isActive3);
      setDeliveryId(deliveryId);
    }



    const getDeliveryDetails = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/delivery/users/delivery/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          const deliveries = response.data;
          const deliveryWithOrderItems = await Promise.all(
            deliveries.map(async (delivery) => {
              const orderId = delivery.orders.orderId;

              const itemsRes = await axios.get(
          `${API_BASE_URL}/orderItems/orders/${orderId}`,
          { headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } }
        );

        return {
          ...delivery,
          orderItems: itemsRes.data
        };
      })
    );

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


        console.log(deliveryDetails);

      

     console.log(status);
        const handleSubmit = async(deliveryId, status) => {
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
    
        }
        catch{
          console.log("Failed to Update Status")
         
          
        }
      }

      const handleChange2 = (e) => {
          setDeliveredTime(e.target.value); 
        };



      

     
        const handleSubmit2 = async(deliveryId, deliveredTime) => {
         const putData = {
        delivered_time: deliveredTime
      }
          
        try {

        const response = await axios.put(`${API_BASE_URL}/delivery/deliveredTime/${deliveryId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDeliveryDetails(d =>
          d.map(dd =>
            dd.deliveryId === deliveryId
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



      

     
        const handleSubmit3 = async(deliveryId, estimatedTime) => {

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
      
      <div className="m-4 relative overflow-x-auto shadow-md sm:rounded-lg">
        
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white">
              <th scope="col" className="px-6 py-3">Delivery ID</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Order Items</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Estimated Time</th>
              <th scope="col" className="px-6 py-3">Delivered Time</th>
      
            </tr>
            </thead>
            <tbody>
              {deliveryDetails.map((d) => {

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
      return(

              <tr className="bg-white border-b border-gray-200 text-gray-500 hover:bg-gray-700 hover:text-white" key={d.deliveryId}>
                <td className="px-6 py-4 max-w-xs break-words">{d.deliveryId}</td>
                <td className="px-6 py-4 max-w-xs break-words"> {d.orders.customer.username}</td>
                
                  <td className="px-6 py-4 max-w-xs break-words">
                    {d.orderItems.map(oi => (
                    <li className="td-oi">
                    <p>{oi.order_catalog.catalogName} ({oi.quantity})</p>
                    
                    </li>
                    ))}
                  </td>
                
                <td className="px-6 py-4 max-w-xs break-words">{new Date(d.orders.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words"><select id="driver" value={d.delivery_status ? d.delivery_status : ""} onChange={(e) =>
                  
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
                <td className="px-6 py-4 max-w-xs break-words"><input
    type="time"
    className="border rounded px-2 py-1 w-full text-sm"
    value={estimatedTime}
    onChange={(e) => handleSubmit3(d.deliveryId, e.target.value)}
  /></td>
                <td className="px-6 py-4 max-w-xs break-words"><input
    type="time"
    className="border rounded px-2 py-1 w-full text-sm"
    value={deliveredTime}
    onChange={(e) => handleSubmit2(d.deliveryId, e.target.value)}
  /></td>
                </tr>
                 )})}
            </tbody>
            </table>

           
    </div>

     
    </div>
  )
}

export default DeliveriesList