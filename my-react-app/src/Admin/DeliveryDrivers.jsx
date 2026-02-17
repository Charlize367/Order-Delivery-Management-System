import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';


const DeliveryDrivers = () => {
  const API_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [inputData, setInputData] = useState({
    userId : null,
    username: "",
    password: "",
    role: "DELIVERY"
   })
   const [deliveryDrivers, setDeliveryDrivers] = useState([]);
   const [resource_ID, setResource_ID] = useState(null);
   const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [showPopup3, setShowPopup3] = useState(false);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
           
  const handleDeleteClick = (id) => {
         setShowDeleteConfirm(!showDeleteConfirm); 
         setDeleteId(id);
  };

   
   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    username: "",
    password: "",
    role: "DELIVERY"
  });
  };

  const openUpdateForm = (id) => {
    
    const selectedDeliveryDriver = deliveryDrivers.find(deliveryDriver => deliveryDriver.userId === id)
    setResource_ID(id);
    if (selectedDeliveryDriver) {
      setInputData({
      userId : selectedDeliveryDriver.userId,
      username: selectedDeliveryDriver.username,
      password: selectedDeliveryDriver.password,
      role: "DELIVERY"
      });
    }
    
    setIsActive2(!isActive2);
}



const updateID = deliveryDrivers.find(d => d.userId === resource_ID)?.userId;
  




  const handleChange = (e) => {
    const { name, value} = e.target;
  setInputData({ ...inputData, [name]: value });
  }



    const handleSubmit = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post(`${API_URL}/users`, inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;
                fetchData();
                 event.target.reset();
                openForm(isActive);

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                console.log(inputData);
                return true;

            } catch (error) {
                console.error('Failed to add customer:', error);
                if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
            }
                return false;
                
            }

        }

        const fetchData = async (page = 0) => {
          try {
            const response = await axios.get(`${API_URL}/users?page=${page}&size=${pageSize}&role=DELIVERY`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setDeliveryDrivers(response.data.content);
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
        fetchData(0);
    }, []);


      const deleteData = async () => {
        setShowDeleteConfirm(false);
        try {
          const response = await axios.delete(`${API_URL}/users/delivery/${deleteId}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

                    setShowPopup2(true);

   
                setTimeout(() => setShowPopup2(false), 3000);
          console.log("Deleted");
          setDeleteId(0);
          fetchData();
        } catch (error) {
          console.log("Failed to delete.");
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
            }
        }
      }


      const updateData = async (e) => {
        e.preventDefault();

      
      
        try {

          const response = await axios.put(`${API_URL}/users/${updateID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
                    setShowPopup3(true);

   
                setTimeout(() => setShowPopup3(false), 3000);
          console.log("Updated");
          fetchData();
           event.target.reset();
          openUpdateForm(isActive2);
        } catch (error) {
          console.log("Failed to Update.");
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
            }
        if(error.response?.data.message == "Could not commit JPA transaction") {
            window.alert("User has pending transactions and cannot be deleted.");
          }
         
        }
      }
      

    

  return (
    <div className="body">
      <Header />
      <div className="users">
        <button onClick={openForm} class="flex justify-center  cursor-pointer m-10 rounded-sm bg-[#096E22] hover:bg-[#075515] rounded-sm px-12 py-3 text-sm font-medium text-white " href="#">
          Add Drivers +
        </button>
        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div  className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Add Driver
                        </h3>
                        <button type="button" onClick={openForm} className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="username" placeholder="Username" name="username"  className="block mb-2 text-sm font-medium text-gray-100">Name</label>
                          <input type="text" name="username" id="username" value={inputData.username} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Name" required/>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-100">Password</label>
                          <input type="password" name="password" id="password" value={inputData.password} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Password" required/>
                        </div>
                      </div>
                      <input type="hidden" name="role" value="CUSTOMER" onChange={handleChange} />
                        <button type="submit" className="text-white inline-flex items-center cursor-pointer  rounded-sm bg-[#096E22] hover:bg-[#075515] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={setShowRateLimitPopup} fetchData={fetchData} currentPage={currentPage} />
        )}

         {showPopup && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Driver added successfully.</div>
        </div>
        </div>
        </div>
              )}

        {showPopup2 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Driver deleted successfully.</div>
        </div>
        </div>
        </div>
              )}

        {showPopup3 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Driver details updated successfully.</div>
        </div>
        </div>
        </div>
              )}

        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}

         <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-6">
          {deliveryDrivers.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
  <thead className="bg-[#232323] text-gray-200 border-b border-[#2f2f2f]">
    <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white">
      <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200 text-left">Driver Name</th>
      <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200 text-left">Account Password</th>
      <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200 text-center">Actions</th>
    </tr>
  </thead>
  <tbody className="bg-[#1f1f1f]">
    {deliveryDrivers.map(driver => (
      <tr
        key={driver.userId}
        className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white"
      >
        <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300 align-middle">{driver.username}</td>
        <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300 align-middle">{driver.password}</td>
        <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300 align-middle text-center">
          <div className="flex items-center justify-center gap-2">
           
            <button
              className="cursor-pointer p-1 rounded-md bg-transparent hover:bg-[#38A45C] transition-colors duration-150"
              onClick={() => openUpdateForm(driver.userId)}
            >
              <img className="w-5 h-5" src="/edit-icon.svg" alt="Edit" />
            </button>

            
            <button
              className="cursor-pointer p-1 rounded-md bg-transparent hover:bg-[#E53935] transition-colors duration-150"
              onClick={() => handleDeleteClick(driver.userId)}
            >
              <img className="w-5 h-5" src="/delete-icon.svg" alt="Delete" />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          )}
          {isActive2 && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Edit Delivery Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={updateData} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="username" placeholder="Username" name="username"  className="block mb-2 text-white text-sm font-medium text-gray-900">Name</label>
                          <input type="text" name="username" id="username" value={inputData.username} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Name" required/>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="password" className="block mb-2 text-white text-sm font-medium text-gray-900">Password</label>
                          <input type="password" name="password" id="password" value={inputData.password} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Password" required/>
                        </div>
                      </div>
                        <button type="submit" className="text-white cursor-pointer inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}

        {showDeleteConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-xs rounded-lg bg-[#1e1e1e] px-6 py-5 text-gray-200 text-center shadow-lg">
      
      <h2 className="text-base font-semibold mb-2">Confirm Delete</h2>
      <p className="text-sm text-gray-400 mb-4">
        Are you sure you want to delete this customer/user?
      </p>

      <div className="space-y-2">
        <button
          onClick={deleteData}
          className="w-full cursor-pointer rounded-md bg-gradient-to-r from-[#56C789] to-[#096E22] py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Yes, Delete
        </button>

        <button
          onClick={handleDeleteClick}
          className="w-full cursor-pointer rounded-md border border-[#56C789] py-2 text-sm text-[#56C789] hover:bg-[#56C789]/10 transition"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
        </div>
      </div>

      {!isLoading && deliveryDrivers.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no drivers found.</p>
      )}


      {deliveryDrivers.length > 0 && (
      <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchData} />
      </div>  
      )}
    </div>
  )
}


export default DeliveryDrivers;


