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
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [deleteId, setDeleteId] = useState(0);
   const [isLoading, setIsLoading] = useState(true);
   const [visiblePasswords, setVisiblePasswords] = useState({});

   const togglePasswordVisibility = (id) => {
     setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
   };

    const handleDeleteClick = (id) => {
      setShowDeleteConfirm(!showDeleteConfirm);
      setDeleteId(id);
   };



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
              const response = await axios.delete(`${API_URL}/users/customers/${deleteId}`, {
                  headers: {
                            'Authorization' : `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }});
                        setShowPopup2(true);


                    setTimeout(() => setShowPopup2(false), 3000);
              setDeleteId(0);
              fetchData();
            } catch (error) {
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
          fetchData();
           e.target.reset();
          openUpdateForm(isActive2);

        } catch (error) {
          if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);

          }

        }
      }

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="body bg-[#F7F1E8] min-h-screen">
      <Header />
      <div className="users max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        <div className="flex items-center justify-between pt-8 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#3B2A20]">Customers</h1>
            <p className="text-sm text-[#3B2A20]/60 mt-1">Manage registered customer accounts</p>
          </div>
          <button onClick={openForm} className="flex justify-center items-center gap-2 cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-6 py-3 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Add Customer
          </button>
        </div>

        {!isLoading && customers.length == 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
            <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6-2a4 4 0 10-4-4"/></svg>
            <p className="text-lg">There are no customers found.</p>
          </div>
        )}
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchData} currentPage={currentPage} />
        )}

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Add Customer
                        </h3>
                        <button type="button" onClick={openForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="username" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" name="username" id="username" value={inputData.username} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Name" required/>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#3B2A20]">Password</label>
                          <input type="password" name="password" id="password" value={inputData.password} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Password" required/>
                        </div>
                      </div>
                      <input type="hidden" name="role" value="CUSTOMER" onChange={handleChange} />
                        <button type="submit" className="text-[#F7F1E8] inline-flex items-center justify-center w-full sm:w-auto cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )}


        {showPopup && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Customer added successfully.</div>
        </div>
        </div>
        </div>
              )}

        {showPopup2 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Customer deleted successfully.</div>
        </div>
        </div>
        </div>
              )}

        {showPopup3 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5 z-50" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Customer details updated successfully.</div>
        </div>
        </div>
        </div>
              )}
        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
            </div>
          )}

        <div className="relative overflow-x-auto rounded-xl shadow-md border border-[#A65A34]/10">
          {customers.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right">
          <thead className="sticky top-0 bg-[#EFE6D8] text-[#3B2A20] border-b border-[#A65A34]/15 z-10">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Customer</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Password</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-center">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {customers.map(customer => (
              <tr className="border-b border-[#A65A34]/10 hover:bg-[#FBF8F3] transition-colors duration-150"  key={customer.userId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#A65A34]/15 text-[#A65A34] font-semibold flex items-center justify-center shrink-0">
                      {getInitial(customer.username)}
                    </div>
                    <span className="font-medium">{customer.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tracking-wider">
                      {visiblePasswords[customer.userId] ? customer.password : "••••••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(customer.userId)}
                      className="text-xs text-[#A65A34] hover:text-[#8A4A2A] cursor-pointer font-medium"
                    >
                      {visiblePasswords[customer.userId] ? "Hide" : "Show"}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs break-words text-sm align-middle text-center">
          <div className="flex items-center justify-center gap-2">

            <button
              className="cursor-pointer p-2 rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 shadow-sm"
              onClick={() => openUpdateForm(customer.userId)}
            >
              <img className="w-4 h-4" src="/edit-icon.svg" alt="Edit" />
            </button>


            <button
              className="cursor-pointer p-2 rounded-lg bg-[#3B2A20] hover:bg-[#2A1D15] transition-colors duration-150 shadow-sm"
              onClick={() => handleDeleteClick(customer.userId)}
            >
              <img className="w-4 h-4" src="/delete-icon.svg" alt="Delete" />
            </button>
          </div>
        </td>

            </tr>
            ))}
            </tbody>

          </table>
          )}


        {isActive2 && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Edit Customer Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={updateData} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="username" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" name="username" id="username" value={inputData.username} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Name" required/>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#3B2A20]">Password</label>
                          <input type="password" name="password" id="password" value={inputData.password} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Password" required/>
                        </div>
                      </div>
                        <button type="submit" className="text-[#F7F1E8] cursor-pointer inline-flex items-center justify-center w-full sm:w-auto bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )}

        {showDeleteConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-[#3B2A20]/50 backdrop-blur-sm px-4">
    <div className="w-full max-w-sm rounded-2xl bg-[#F7F1E8] px-7 py-7 text-[#3B2A20] text-center shadow-2xl">

      <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
      <p className="text-sm text-[#3B2A20]/70 mb-6">
        Are you sure you want to delete this customer/user?
      </p>

      <div className="space-y-3">
        <button
          onClick={deleteData}
          className="w-full cursor-pointer rounded-lg bg-[#A65A34] py-2.5 text-sm font-medium text-[#F7F1E8] transition-colors duration-150 hover:bg-[#8A4A2A]"
        >
          Yes, Delete
        </button>

        <button
          onClick={handleDeleteClick}
          className="w-full cursor-pointer rounded-lg border border-[#A65A34] py-2.5 text-sm text-[#A65A34] transition-colors duration-150 hover:bg-[#A65A34]/10"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


        </div>
      </div>

      {customers.length > 0 && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchData} />
      </div>
      )}
    </div>
  )
}


export default Customers;