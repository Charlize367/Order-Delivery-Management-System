import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';

const Checkout = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const orderData = {
    address: address

  }
    const getAllBasketItems = async () => {
    try {
            const response = await axios.get(`${API_URL}/basket/users/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
          setItems(response.data);
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
  console.log(items);

  useEffect(() => {
        getAllBasketItems();
    }, []);

    const total = items.reduce((sum, basket) => sum + basket.subtotal, 0);


  const placeOrder = async() => {

    if(!address) {

        window.alert("Address is required.");
    }
    try {
      const response = await axios.post(`${API_URL}/orders/users/${user_ID}`, orderData, {
        headers : {
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        }
      })

      navigate('/order', {state: {showPopup: true}});
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
   
    

  return (
    <div className="body">
      <Header />
    
    <div class="bg-[#232323]">
        <div class="flex max-md:flex-col gap-12 max-lg:gap-4 h-full">
            <div class="bg-[#2a2a2a] p-10 md:h-screen md:sticky md:top-0 md:min-w-[800px]">
                <div class="relative h-full">
                    <div class="px-6 py-20 md:overflow-auto md:h-screen">
                        <div class="space-y-4">
                          {items.map(b => (
                            <div class="flex items-start gap-4">
                                <div class="w-24 h-24 flex p-3 shrink-0 bg-white rounded-md">
                                    <img src={`https://${bucket}.s3.${region}.amazonaws.com/${b.catalog.catalog_image}`} class="w-full object-contain" />
                                </div>
                                <div class="w-full">
                                    <h3 class="text-sm text-white font-semibold">{b.catalog.catalogName}</h3>
                                    <ul class="text-xs text-gray-200 space-y-2 mt-3">
                                        <li class="flex flex-wrap gap-4">Quantity <span class="ml-auto">{b.quantity}</span></li>
                                        <li class="flex flex-wrap gap-4">Total Price <span class="ml-auto font-semibold">PHP {b.subtotal}</span></li>
                                    </ul>
                                </div>
                            </div>
                          ))}

                          {showRateLimitPopup && (
                            <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getAllBasketItems} currentPage={currentPage} />
                            )}

                            {isLoading && (
                                <div className="flex items-center justify-center my-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
                                </div>
                            )}

                           
                        </div>
                        <hr class="border-gray-300 my-8" />
                        <div>
                            <ul class="text-white font-medium space-y-4">
                              
                                
                                
                                <li class="flex flex-wrap gap-4 text-[15px] font-semibold text-gray-200">Total <span class="ml-auto">PHP {total}</span></li>
                            </ul>

                            <div class="mt-8">
                                <button onClick={placeOrder} type="button" class="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide cursor-pointer bg-green-800 text-white cursor-pointer">Complete Purchase</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-4xl w-full h-max rounded-md px-4 py-20 max-md:-order-1">
                <form>
                    <div>
                        <h2 class="text-xl text-white font-semibold mb-6">Delivery Details</h2>
                        <div class="grid lg:grid-cols-1 gap-y-6 gap-x-4">
                            <div className="mr-10">
                                <label class="text-sm text-white font-medium block mb-2">Address</label>
                                <input onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Enter Address"
                                    className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required/>
                            </div>
                            {/* <div className="mr-10">
                                <label class="text-sm text-white font-medium block mb-2">Note to Driver</label>
                                <input type="text" placeholder="Enter Note"
                                    className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " />
                            </div> */}
                            
                        </div>
                    </div>

                    <div class="mt-12">
                        <h2 class="text-xl text-white font-semibold mb-6">Payment</h2>
                        <div class="grid gap-4 lg:grid-cols-2">
                            <div class="bg-[#2a2a2a] p-4 rounded-md border border-[#2f2f2f] max-w-sm">
                                <div>
                                    <div class="flex items-center">
                                        <input type="radio" name="method" class="w-5 h-5 cursor-pointer" id="card" checked />
                                        <label for="card" class="ml-4 mb-4 flex gap-2 cursor-pointer">
                                            <p class="mt-4 text-sm text-gray-200 font-medium">Cash On Delivery</p>
                                        </label>
                                    </div>
                                </div>
                                
                            </div>
                          
                        </div>
                    </div>

                </form>
            </div>
        </div>
    </div>
    
   
    </div>
  )
}

export default Checkout