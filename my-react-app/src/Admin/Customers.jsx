import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';


const Customers = () => {
  const API_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [inputData, setInputData] = useState({
    userId : null,
    username: "",
    password: "",
    role: "CUSTOMER"
   })
   const [customers, setCustomers] = useState([]);
   const [resourceId, setResourceId] = useState(null);
   const [showPopup, setShowPopup] = useState(false);
   const [showPopup2, setShowPopup2] = useState(false);
   const [showPopup3, setShowPopup3] = useState(false);
   const [currentPage, setCurrentPage] = useState(0);
   const [totalPages, setTotalPages] = useState(0);
   const [pageSize] = useState(5);
   const [retryTime, setRetryTime] = useState(0);
   const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
   const [error, setError] = useState("");

   

   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    username: "",
    password: "",
    role: "CUSTOMER"
  });
  };

  const openUpdateForm = (id) => {
    
    const selectedCustomer = customers.find(customer => customer.userId === id)
    setResourceId(id);
    if (selectedCustomer) {
      setInputData({
      userId : selectedCustomer.userId,
      username: selectedCustomer.username,
      password: selectedCustomer.password,
      role: "CUSTOMER"
      });
    }
    
    setIsActive2(!isActive2);
}
console.log(inputData);


const updateID = customers.find(c => c.userId === resourceId)?.userId;
  




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
               

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                console.log(inputData);
                 event.target.reset();
                 
                 openForm(isActive);
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
            const response = await axios.get(`${API_URL}/users?page=${page}&size=${pageSize}&role=CUSTOMER`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setCustomers(response.data.content);
            setCurrentPage(response.data.number);
            setTotalPages(response.data.totalPages);
            
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


      const deleteData = async (id) => {

            try {
              const response = await axios.delete(`${API_URL}/users/customers/${id}`, {
                  headers: {
                            'Authorization' : `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }});
                        setShowPopup2(true);

      
                    setTimeout(() => setShowPopup2(false), 3000);
              console.log("Deleted");
            
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
           e.target.reset();
          openUpdateForm(isActive2);
          
        } catch (error) {
          console.log("Failed to Update.");
          
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
      <div className="users">
        
        <button onClick={openForm} class="flex justify-center  m-10 rounded-sm bg-gradient-to-r from-[#56C789] to-[#096E22] px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600" href="#">
          Add Customers +
        </button>

        {customers.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no customers found.</p>
        )}
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchData} currentPage={currentPage} />
        )}

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Add Customer
                        </h3>
                        <button type="button" onClick={openForm} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
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
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder=" Email" required/>
                        </div>
                      </div>
                      <input type="hidden" name="role" value="CUSTOMER" onChange={handleChange} />
                        <button type="submit" className="text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}


        {showPopup && (
            <div className="add-user-popup">
              Customer added successfully.
            </div>
              )}

              {showPopup2 && (
            <div className="del-user-popup">
              Customer deleted successfully.
            </div>
              )}

              {showPopup3 && (
            <div className="upd-user-popup">
              Customer details updated successfully.
            </div>
              )}

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-6">
          {customers.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="bg-[#232323] text-gray-200 border-b border-[#2f2f2f]">
            <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white">
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Customer Name</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Account Password</th>
              <th scope="col" className="px-6 py-3 text-sm font-semibold text-gray-200">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-[#1f1f1f]">
            {customers.map(customer => (
              <tr className="border-b border-[#2a2a2a] hover:bg-[#262626] transition hover:text-white"  key={customer.userId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{customer.username}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300">{customer.password}</td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-300"><center><button className="editBtn"><img className="w-5 h-5" src="/edit-icon.svg" onClick={() => openUpdateForm(customer.userId)}/></button>
                <button className="deleteBtn"><img className="w-5 h-5" src="/delete-icon.svg" onClick={() => deleteData(customer.userId)} /></button></center>
                </td>
            </tr>
            ))}
            </tbody>
            
          </table>
          )}
        

        {isActive2 && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div  className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Edit Customer Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={updateData} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="username" placeholder="Username" name="username"  className="block mb-2 text-sm font-medium text-gray-100">Name</label>
                          <input type="text" name="username" id="username" value={inputData.username} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Name" required/>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-100">Password</label>
                          <input type="password" name="password" id="password" value={inputData.password} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder=" Email" required/>
                        </div>
                      </div>
                        <button type="submit" className="text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}
        
        
        </div>
      </div>

      {customers.length > 0 && (
      <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchData} />
      </div>  
      )}
    </div>
  )
}


export default Customers;


