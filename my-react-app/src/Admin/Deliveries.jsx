import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';


const Deliveries = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('jwtToken');
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isActive2, setIsActive2] = useState(false);
    const [isActive3, setIsActive3] = useState(false);
    const [status, setStatus] = useState("");
    const [driver, setDriver] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(5);
    const [selectedDriverId, setSelectedDriverId] = useState(0);
    const [deliveryId, setDeliveryId] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState("00:00");
    const [drivers, setDrivers] = useState([]);
   const [retryTime, setRetryTime] = useState(0);
   const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
   const [error, setError] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   
  
    
    
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

    console.log(deliveryDetails);
  const getDeliveryDetails = async (page = 0) => {
    try {
            const response = await axios.get(`${API_URL}/delivery?page=${page}&size=${pageSize}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

          
          const deliveries = response.data.content;
         

        
          const sortedDeliveries = deliveries.sort(
      (a, b) => a.deliveryId - b.deliveryId
    );

    setDeliveryDetails(sortedDeliveries);
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
        getDeliveryDetails(0);
    }, []);


  
    const getDriver = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/role/DELIVERY`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

              setDrivers(response.data);
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
      getDriver();

    }, [])

     
        const handleSubmit = async(deliveryId, status ) => {
        
          const putData = {
        delivery_status: status
      }
          console.log("Selected status:", status);
        try {

        const response = await axios.put(`${API_URL}/delivery/deliveryStatus/${deliveryId}`, putData , {
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

     
        const handleSubmit2 = async(deliveryId, driverId) => {
       
         
          console.log("Selected status:", status);
          console.log(driverId);
        try {
    


        const response = await axios.put(`${API_URL}/delivery/${deliveryId}/drivers/${driverId}`, {}, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    console.log(response);
         setDriver(response.data);
          
     getDeliveryDetails();
      
        }
        catch (error) {
          console.log("Failed to Update Status");
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          
        }
      }


     
        const handleSubmit3 = async(deliveryId, estimatedTime ) => {
         
        const putData = {
        estimated_time: estimatedTime
      }
        try {

        const response = await axios.put(`${API_URL}/delivery/estimatedTime/${deliveryId}`, putData , {
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
        catch (error) {
          console.log("Failed to Update Time");
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
      
       <div className="relative overflow-x-auto  shadow-xl rounded-xl sm:rounded-lg m-6">
        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="bg-[#232323] text-gray-200 border-b border-[#2f2f2f]">
            <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white">
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Delivery ID</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Driver</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Customer</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Date</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Status</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Address</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Estimated Time</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Delivered Time</th>
      
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
            <tbody className="bg-[#1f1f1f]">
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getDeliveryDetails} currentPage={currentPage} />
        )}
              <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white" key={d.deliveryId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{d.deliveryId}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">
                  <select id="driver" value={d.deliveryMen ? d.deliveryMen.userId : ""} onChange={(e) =>
                  
                    handleSubmit2(d.deliveryId, e.target.value)
                    } className="selectOrderStatus">
                <option value="">Assign a driver...</option>
                {drivers.map(dd => (
                <option key={dd.userId} value={dd.userId}>{dd.username}</option>
                ))}
              </select></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{d.order.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{new Date(d.order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words">
                  <select id="status" value={d.delivery_status ? d.delivery_status : ""} onChange={(e) =>
                  
                    handleSubmit(d.deliveryId, e.target.value)
                    } className="selectOrderStatus">
                <option value="">Update Status...</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Driver Assigned">Driver Assigned</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              
              </select></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{d.address}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300"><input type="time" id="eta" name="estimatedTime" value={d.estimated_time} onChange={(e) =>
                    handleSubmit3(d.deliveryId, e.target.value)
                    }/></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{delTime}</td>

                
                
            </tr>
          
            </tbody>
             )})}
            </table>

           

          </div>

    {!isLoading && deliveryDetails.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no deliveries found.</p>
    )}

    {deliveryDetails.length > 0 && (
     <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getDeliveryDetails} />
      </div>

    )}
    </div>
    
  )
}
        

export default Deliveries