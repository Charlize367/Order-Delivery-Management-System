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
        try {

        const response = await axios.put(`${API_URL}/delivery/deliveryStatus/${deliveryId}`, putData , {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

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


        const handleSubmit2 = async(deliveryId, driverId) => {

        try {



        const response = await axios.put(`${API_URL}/delivery/${deliveryId}/drivers/${driverId}`, {}, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

         setDriver(response.data);

     getDeliveryDetails();

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
        <h1 className="text-2xl font-bold text-[#3B2A20]">Deliveries</h1>
        <p className="text-sm text-[#3B2A20]/60 mt-1">Track and manage active deliveries</p>
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
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Delivery ID</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Driver</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Customer</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Date</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Status</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Address</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Estimated Time</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold">Delivered Time</th>

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




      return(
            <tbody className="bg-white">
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getDeliveryDetails} currentPage={currentPage} />
        )}
              <tr className="border-b border-[#A65A34]/10 hover:bg-[#FBF8F3] transition-colors duration-150" key={d.deliveryId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20] font-medium">#{d.deliveryId}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">
                  <select id="driver" value={d.deliveryMen ? d.deliveryMen.userId : ""} onChange={(e) =>

                    handleSubmit2(d.deliveryId, e.target.value)
                    } className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] p-2">
                <option value="">Assign a driver...</option>
                {drivers.map(dd => (
                <option key={dd.userId} value={dd.userId}>{dd.username}</option>
                ))}
              </select></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{d.order.customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{new Date(d.order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}</td>
                <td className="px-6 py-4 max-w-xs break-words">
                  <select id="status" value={d.delivery_status ? d.delivery_status : ""} onChange={(e) =>

                    handleSubmit(d.deliveryId, e.target.value)
                    } className={`text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] p-2 border font-medium ${statusBadgeClass(d.delivery_status)}`}>
                <option value="">Update Status...</option>
                <option value="Pending Assignment">Pending Assignment</option>
                <option value="Driver Assigned">Driver Assigned</option>
                <option value="On the Way">On the Way</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>

              </select></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{d.address}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]"><input type="time" id="eta" name="estimatedTime" value={d.estimated_time} onChange={(e) =>
                    handleSubmit3(d.deliveryId, e.target.value)
                    } className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] p-2"/></td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">{delTime}</td>



            </tr>

            </tbody>
             )})}
            </table>



          </div>

    {!isLoading && deliveryDetails.length == 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
          <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l1.5-3h15L21 7M3 7v12a1 1 0 001 1h16a1 1 0 001-1V7M3 7h18M9 12h6"/></svg>
          <p className="text-lg">There are no deliveries found.</p>
        </div>
    )}

    {deliveryDetails.length > 0 && (
     <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={getDeliveryDetails} />
      </div>

    )}
    </div>

  )
}


export default Deliveries