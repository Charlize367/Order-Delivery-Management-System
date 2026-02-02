import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';

const ItemDetails = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const param = useParams();
    const [item, setItem] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [quantity, setQuantity] = useState(1);
    const customer = localStorage.getItem('username');
    const [showPopup, setShowPopup] = useState(false);
    const [retryTime, setRetryTime] = useState(0);
    const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
    const [error, setError] = useState("");

    
    
    console.log(item);

    

    const fetchCatalogByCategory = async () => {
          try {
            const response = await axios.get(`${API_URL}/catalog/${param.id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

          console.log(response);
          setItem(response.data);
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
        fetchCatalogByCategory();
    }, [param.id]);



    
    

     const addToBasket = async (event) => {
        event.preventDefault();


        const postData = {
        basket_ID: null,
        customer: null,
        catalog: null,
        quantity: quantity,
        subtotal: item.catalog_price * quantity
    }
      
            try {
              
                const response = await axios.post(`${API_URL}/basket/users/${user_ID}/catalog/${item.catalogId}`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                
               
                console.log(response);
                return true;

            } catch (error) {
                console.error('Failed to add to cart:', error);
                if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
                return false;
              
            }

        }

        const addToQuantity = () => {

          setQuantity(quantity + 1);

        }


        const minusFromQuantity =  () => {

          setQuantity(quantity - 1);

        }


  return (
    <div className="body">
      <Header />

      {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCatalogByCategory} currentPage={currentPage} />
  )}
      
              {showPopup && (
           <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Item added to basket.</div>
        </div>
        </div>
   
              )}
              

     <div class="p-20 m-10 bg-[#282928] rounded-4xl">
      <div class="lg:max-w-6xl max-w-xl mx-auto">
        <div class="grid items-start grid-cols-1 lg:grid-cols-2 gap-8 max-lg:gap-12 max-sm:gap-8">
          <div class="w-full lg:sticky top-0">
            <div class="flex flex-col gap-4">
              <div class="bg-white shadow-sm p-2">
                <img src={`${API_BASE_URL}/images/${item.catalog_image}`} alt="Product"
                  class="w-full  aspect-[11/8] object-cover object-top" />
              </div>
              
            </div>
          </div>

          <div class="w-full md:mt-10">
            <div>
              <h3 class="text-4xl sm:text-4xl font-semibold text-white">{item.catalogName}</h3>
              
              <div class="mt-4">
                <p class="text-slate-100 mt-1 text-sm">{item.catalog_description}</p>
              </div>

              <div class="flex items-center flex-wrap gap-2 mt-6">
                
                <h4 class="text-[#56C789] text-2xl sm:text-3xl font-semibold">PHP {item.catalog_price}</h4>
                
              </div>

             
            </div>

            <hr class="my-6 mt-30 border-gray-300" />

            <div>
              

              <div class="mt-4 flex flex-wrap gap-4">
                <div class="flex gap-4 items-center border border-gray-300 bg-white px-4 py-2.5 w-max">
                <button onClick={minusFromQuantity} type="button" class="border-0 outline-0 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" viewBox="0 0 121.805 121.804">
                    <path
                      d="M7.308 68.211h107.188a7.309 7.309 0 0 0 7.309-7.31 7.308 7.308 0 0 0-7.309-7.309H7.308a7.31 7.31 0 0 0 0 14.619z"
                      data-original="#000000" />
                  </svg>
                </button>
                <span clsemiass="text-slate-900 text-sm font-semibold px-6 block">{quantity}</span>
                <button onClick={addToQuantity} type="button" class="border-0 outline-0 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" viewBox="0 0 512 512">
                    <path
                      d="M256 509.892c-19.058 0-34.5-15.442-34.5-34.5V36.608c0-19.058 15.442-34.5 34.5-34.5s34.5 15.442 34.5 34.5v438.784c0 19.058-15.442 34.5-34.5 34.5z"
                      data-original="#000000" />
                    <path
                      d="M475.392 290.5H36.608c-19.058 0-34.5-15.442-34.5-34.5s15.442-34.5 34.5-34.5h438.784c19.058 0 34.5 15.442 34.5 34.5s-15.442 34.5-34.5 34.5z"
                      data-original="#000000" />
                  </svg>
                </button>
              </div>
                <button onClick={addToBasket} type="button"
                  class="px-4 py-5 w-[60%]  cursor-pointer border border-green-600 bg-gradient-to-r from-[#56C789] to-[#096E22] hover:bg-gradient-to-r from-[#56C789] to-[#096E22] text-white text-md font-medium">Add to basket</button>
              </div>
            </div>

            

            
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default ItemDetails