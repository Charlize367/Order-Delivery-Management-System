import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';


const PromoCodes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [inputData, setInputData] = useState({
    code: "",
    discountType: "",
    discountValue: 0.0,
    startDate: "",
    expiryDate: "",
    usageLimit: 0,
    minimumOrderAmount: 0.0,
    maximumDiscountAmount: 0.0,
    description: "",
   })
   const [promoCodes, setPromoCodes] = useState([]);
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


   console.log(promoCodes);

   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    code: "",
    discountType: "",
    discountValue: 0.0,
    startDate: "",
    expiryDate: "",
    usageLimit: 0,
    minimumOrderAmount: 0.0,
    maximumDiscountAmount: 0.0,
    description: "",
  });
  };

  const openUpdateForm = (id) => {

    const selectedPromoCode = promoCodes.find(promoCodes => promoCodes.promoCodeId === id)
    setResourceId(id);
    if (selectedPromoCode) {
      setInputData({
        code: selectedPromoCode.code,
        discountType: selectedPromoCode.discountType,
        discountValue: selectedPromoCode.discountValue,
        startDate: selectedPromoCode.startDate,
        expiryDate: selectedPromoCode.expiryDate,
        usageLimit: selectedPromoCode.usageLimit,
        minimumOrderAmount: selectedPromoCode.minimumOrderAmount,
        maximumDiscountAmount: selectedPromoCode.maximumDiscountAmount,
        description: selectedPromoCode.description,
      });
    }

    setIsActive2(!isActive2);
}


const updateID = promoCodes.find(c => c.promoCodeId === resourceId)?.userId;




  const handleChange = (e) => {
    const { name, value} = e.target;
  setInputData({ ...inputData, [name]: value });
  }




    const handleSubmit = async (event) => {
        event.preventDefault();

            try {

                const response = await axios.post(`${API_URL}/promoCode`, inputData, {
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
                console.error('Failed to add Promo Code:', error);
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
            const response = await axios.get(`${API_URL}/promoCode?page=${page}&size=${pageSize}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setPromoCodes(response.data.content);
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


    //   const deleteData = async () => {

    //   setShowDeleteConfirm(false);
    //         try {
    //           const response = await axios.delete(`${API_URL}/users/customers/${deleteId}`, {
    //               headers: {
    //                         'Authorization' : `Bearer ${token}`,
    //                         'Content-Type': 'application/json'
    //                     }});
    //                     setShowPopup2(true);


    //                 setTimeout(() => setShowPopup2(false), 3000);
    //           setDeleteId(0);
    //           fetchData();
    //         } catch (error) {
    //           if (error.response?.data === "Too many requests" || error.response?.status === 429) {
    //             const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
    //             setRetryTime(retryAfter);
    //             setError("Too Many Requests");
    //             setShowRateLimitPopup(true);


    //       }

    //       if(error.response?.data.message == "Could not commit JPA transaction") {
    //         window.alert("User has pending transactions and cannot be deleted.");
    //       }

    //         }
    //   }


      const updateData = async (e) => {
        e.preventDefault();



        try {

          const response = await axios.put(`${API_URL}/promoCodes/${updateID}`, inputData, {
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

  const toggleActiveStatus = async (id, isCurrentlyActive) => {
    try {
      const endpoint = isCurrentlyActive ? "deactivate" : "activate";
      await axios.patch(`${API_URL}/promoCode/${id}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchData(currentPage);
    } catch (error) {
      console.error('Failed to toggle promo code status:', error);
      if (error.response?.data === "Too many requests" || error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
        setRetryTime(retryAfter);
        setError("Too Many Requests");
        setShowRateLimitPopup(true);
      }
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  const formatDiscount = (p) => {
    if (p.discountType === "PERCENTAGE") return `${p.discountValue}% off`;
    if (p.discountType === "FIXED_AMOUNT") return `$${p.discountValue} off`;
    return p.discountValue;
  }

  return (
    <div className="body bg-[#F7F1E8] min-h-screen">
      <Header />
      <div className="users max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        <div className="flex items-center justify-between pt-8 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-[#3B2A20]">Promo Codes</h1>
            <p className="text-sm text-[#3B2A20]/60 mt-1">Manage registered promo codes</p>
          </div>
          <button onClick={openForm} className="flex justify-center items-center gap-2 cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-6 py-3 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Add Promo Codes
          </button>
        </div>

        {!isLoading && promoCodes.length == 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#3B2A20]/50">
            <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4 4 4 0 004 4zm6-2a4 4 0 10-4-4"/></svg>
            <p className="text-lg">There are no promo codes found.</p>
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
                            Add Promo Code
                        </h3>
                        <button type="button" onClick={openForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="col-span-2">
                          <label htmlFor="code" className="block mb-2 text-sm font-medium text-[#3B2A20]">Code</label>
                          <input type="text" name="code" id="code" value={inputData.code} onChange={handleChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. SUMMER25" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="discountType" className="block mb-2 text-sm font-medium text-[#3B2A20]">Discount Type</label>
                          <select name="discountType" id="discountType" value={inputData.discountType} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required>
                            <option value="" disabled>Select type</option>
                            <option value="PERCENTAGE">Percentage</option>
                            <option value="FIXED_AMOUNT">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="discountValue" className="block mb-2 text-sm font-medium text-[#3B2A20]">Discount Value</label>
                          <input type="number" name="discountValue" id="discountValue" value={inputData.discountValue} onChange={handleChange} step="0.01" min="0.01" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-[#3B2A20]">Start Date</label>
                          <input type="datetime-local" name="startDate" id="startDate" value={inputData.startDate} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="expiryDate" className="block mb-2 text-sm font-medium text-[#3B2A20]">Expiry Date</label>
                          <input type="datetime-local" name="expiryDate" id="expiryDate" value={inputData.expiryDate} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="usageLimit" className="block mb-2 text-sm font-medium text-[#3B2A20]">Usage Limit</label>
                          <input type="number" name="usageLimit" id="usageLimit" value={inputData.usageLimit} onChange={handleChange} step="1" min="1" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. 100" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="minimumOrderAmount" className="block mb-2 text-sm font-medium text-[#3B2A20]">Min Order Amount</label>
                          <input type="number" name="minimumOrderAmount" id="minimumOrderAmount" value={inputData.minimumOrderAmount} onChange={handleChange} step="0.01" min="0" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="maximumDiscountAmount" className="block mb-2 text-sm font-medium text-[#3B2A20]">Max Discount Amount</label>
                          <input type="number" name="maximumDiscountAmount" id="maximumDiscountAmount" value={inputData.maximumDiscountAmount} onChange={handleChange} step="0.01" min="0" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00 (optional)"/>
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                          <textarea name="description" id="description" value={inputData.description} onChange={handleChange} maxLength={255} rows={3} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Optional description"/>
                        </div>
                      </div>

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
            <div className="ms-3 text-sm font-normal">Promo Code deleted successfully.</div>
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
            <div className="ms-3 text-sm font-normal">Promo Code updated successfully.</div>
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
          {promoCodes.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right">
          <thead className="sticky top-0 bg-[#EFE6D8] text-[#3B2A20] border-b border-[#A65A34]/15 z-10">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Code</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Discount</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Validity</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-left">Usage Limit</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-center">Status</th>
              <th scope="col" className="px-6 py-3.5 text-sm font-semibold text-center">Actions</th>
            </tr>
            </thead>
            <tbody className="bg-white">
            {promoCodes.map(p => (
              <tr className="border-b border-[#A65A34]/10 hover:bg-[#FBF8F3] transition-colors duration-150" key={p.promoCodeId}>
                <td className="px-6 py-4 max-w-xs break-words text-sm text-[#3B2A20]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#A65A34]/15 text-[#A65A34] flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3.83 3.24a1 1 0 0 0-1 1v5.76a2 2 0 0 0 .59 1.41l9.59 9.59a2 2 0 0 0 2.83 0l5.66-5.66a2 2 0 0 0-.01-2.93Z"/>
                        <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" stroke="none"/>
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold block">{p.code}</span>
                      {p.description && (
                        <span className="text-xs text-[#3B2A20]/50 line-clamp-1 max-w-[180px] block">{p.description}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  <span className="inline-flex items-center rounded-full bg-[#8A9A5B]/15 text-[#5D6B3D] text-xs font-semibold px-2.5 py-1">
                    {formatDiscount(p)}
                  </span>
                  {p.minimumOrderAmount > 0 && (
                    <div className="text-xs text-[#3B2A20]/50 mt-1">Min order ${p.minimumOrderAmount}</div>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  <div>{formatDate(p.startDate)}</div>
                  <div className="text-xs text-[#3B2A20]/50">to {formatDate(p.expiryDate)}</div>
                </td>

                <td className="px-6 py-4 text-sm text-[#3B2A20]">
                  {p.usageLimit ?? "—"}
                </td>

                <td className="px-6 py-4 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => toggleActiveStatus(p.promoCodeId, p.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ${p.active ? "bg-[#8A9A5B]" : "bg-[#3B2A20]/20"}`}
                    aria-pressed={p.active}
                    title={p.active ? "Deactivate" : "Activate"}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${p.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <div className={`text-xs mt-1 font-medium ${p.active ? "text-[#5D6B3D]" : "text-[#3B2A20]/40"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </div>
                </td>

                <td className="px-6 py-4 max-w-xs break-words text-sm align-middle text-center">
          <div className="flex items-center justify-center gap-2">

            <button
              className="cursor-pointer p-2 rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 shadow-sm"
              onClick={() => openUpdateForm(p.promoCodeId)}
              title="Edit"
            >
              <svg className="w-4 h-4 text-[#F7F1E8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.86 3.86a2.1 2.1 0 0 1 2.97 2.97L7.5 19.16l-4 1 1-4L16.86 3.86Z"/>
              </svg>
            </button>


            {/* <button
              className="cursor-pointer p-2 rounded-lg bg-[#3B2A20] hover:bg-[#2A1D15] transition-colors duration-150 shadow-sm"
              onClick={() => handleDeleteClick(p.promoCodeId)}
              title="Delete"
            >
              <svg className="w-4 h-4 text-[#F7F1E8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/>
              </svg>
            </button> */}
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
                            Edit Promo Code Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={updateData} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
                        <div className="col-span-2">
                          <label htmlFor="edit-code" className="block mb-2 text-sm font-medium text-[#3B2A20]">Code</label>
                          <input type="text" name="code" id="edit-code" value={inputData.code} onChange={handleChange} maxLength={50} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. SUMMER25" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-discountType" className="block mb-2 text-sm font-medium text-[#3B2A20]">Discount Type</label>
                          <select name="discountType" id="edit-discountType" value={inputData.discountType} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required>
                            <option value="" disabled>Select type</option>
                            <option value="PERCENTAGE">Percentage</option>
                            <option value="FIXED_AMOUNT">Fixed Amount</option>
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-discountValue" className="block mb-2 text-sm font-medium text-[#3B2A20]">Discount Value</label>
                          <input type="number" name="discountValue" id="edit-discountValue" value={inputData.discountValue} onChange={handleChange} step="0.01" min="0.01" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-startDate" className="block mb-2 text-sm font-medium text-[#3B2A20]">Start Date</label>
                          <input type="datetime-local" name="startDate" id="edit-startDate" value={inputData.startDate} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-expiryDate" className="block mb-2 text-sm font-medium text-[#3B2A20]">Expiry Date</label>
                          <input type="datetime-local" name="expiryDate" id="edit-expiryDate" value={inputData.expiryDate} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-usageLimit" className="block mb-2 text-sm font-medium text-[#3B2A20]">Usage Limit</label>
                          <input type="number" name="usageLimit" id="edit-usageLimit" value={inputData.usageLimit} onChange={handleChange} step="1" min="1" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="e.g. 100" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-minimumOrderAmount" className="block mb-2 text-sm font-medium text-[#3B2A20]">Min Order Amount</label>
                          <input type="number" name="minimumOrderAmount" id="edit-minimumOrderAmount" value={inputData.minimumOrderAmount} onChange={handleChange} step="0.01" min="0" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00" required/>
                        </div>

                        <div className="col-span-1">
                          <label htmlFor="edit-maximumDiscountAmount" className="block mb-2 text-sm font-medium text-[#3B2A20]">Max Discount Amount</label>
                          <input type="number" name="maximumDiscountAmount" id="edit-maximumDiscountAmount" value={inputData.maximumDiscountAmount} onChange={handleChange} step="0.01" min="0" max="1000000" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="0.00 (optional)"/>
                        </div>

                        <div className="col-span-2">
                          <label htmlFor="edit-description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                          <textarea name="description" id="edit-description" value={inputData.description} onChange={handleChange} maxLength={255} rows={3} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Optional description"/>
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
        Are you sure you want to delete this promoCode?
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

      {promoCodes.length > 0 && (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchData} />
      </div>
      )}
    </div>
  )
}


export default PromoCodes;