import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'

const Checkout = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const orderData = {
    address: address

  }
    const getAllBasketItems = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/basket/users/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
          setItems(response.data);
          } catch {
            console.error("Error");
            console.log(response);
          
          }
  }
  console.log(items);

  useEffect(() => {
        getAllBasketItems();
    }, []);

    const total = items.reduce((sum, basket) => sum + basket.subtotal, 0);


  const placeOrder = async() => {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders/users/${user_ID}`, orderData, {
        headers : {
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        }
      })

      navigate('/order', {state: {showPopup: true}});
    } catch {
      console.log("Error");
    }
  }
   
    

  return (
    <div className="body">
      <Header />
    {/* <div className="summary-container">
        <h2 className="summary-txt">Order Summary</h2>
        <p className="checkout-item-txt">Items</p>
        <ul className="item-summary">
            {items.map(b => (
              <li className="item-summary-details">
                <img className="summary-img" src={`${API_BASE_URL}/images/${b.catalog.catalog_image}`}/>
                <div className="summary-details">
                    <div className="summary-division">
                        <p className="summary-name">{b.catalog.catalogName}</p>
                        <p className="summary-price">Price: PHP {b.catalog.catalog_price}</p>
                        <p className="summary-quantity">Quantity: {b.quantity}</p>
                    </div>
                    
                    <p className="summary-subtotal">PHP {b.subtotal}</p>
                   
                </div>
                
              </li>
               ))}
        </ul>
        <div className="summary-total">
        <p className="summary-total-txt">Total</p>
        <p className="summary-total-amount-txt"> PHP {total}</p>
        </div>
        <hr className="summary-hr" />
         <p className="address-txt">Address</p>
         <form>
            <input className="address-field" type="text" placeholder="Enter address..." onChange={(e) => setAddress(e.target.value)}/>
         </form>
         <hr className="summary-hr" />
         <button className="confirm-order" onClick={placeOrder}>Confirm Order</button>
    </div> */}
    <div class="bg-white">
        <div class="flex max-md:flex-col gap-12 max-lg:gap-4 h-full">
            <div class="bg-gray-100 md:h-screen md:sticky md:top-0 md:min-w-[800px]">
                <div class="relative h-full">
                    <div class="px-6 py-8 md:overflow-auto md:h-screen">
                        <div class="space-y-4">
                          {items.map(b => (
                            <div class="flex items-start gap-4">
                                <div class="w-24 h-24 flex p-3 shrink-0 bg-white rounded-md">
                                    <img src={`${API_BASE_URL}/images/${b.catalog.catalog_image}`} class="w-full object-contain" />
                                </div>
                                <div class="w-full">
                                    <h3 class="text-sm text-slate-900 font-semibold">{b.catalog.catalogName}</h3>
                                    <ul class="text-xs text-slate-900 space-y-2 mt-3">
                                        <li class="flex flex-wrap gap-4">Quantity <span class="ml-auto">{b.quantity}</span></li>
                                        <li class="flex flex-wrap gap-4">Total Price <span class="ml-auto font-semibold">PHP {b.subtotal}</span></li>
                                    </ul>
                                </div>
                            </div>
                          ))}

                           
                        </div>
                        <hr class="border-gray-300 my-8" />
                        <div>
                            <ul class="text-slate-500 font-medium space-y-4">
                              
                                
                                
                                <li class="flex flex-wrap gap-4 text-[15px] font-semibold text-slate-900">Total <span class="ml-auto">PHP {total}</span></li>
                            </ul>

                            <div class="mt-8">
                                <button onClick={placeOrder} type="button" class="rounded-md px-4 py-2.5 w-full text-sm font-medium tracking-wide bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Complete Purchase</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-4xl w-full h-max rounded-md px-4 py-8 max-md:-order-1">
                <form>
                    <div>
                        <h2 class="text-xl text-slate-900 font-semibold mb-6">Delivery Details</h2>
                        <div class="grid lg:grid-cols-1 gap-y-6 gap-x-4">
                            <div className="mr-10">
                                <label class="text-sm text-slate-900 font-medium block mb-2">Address</label>
                                <input onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Enter Address"
                                    class="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" required/>
                            </div>
                            <div className="mr-10">
                                <label class="text-sm text-slate-900 font-medium block mb-2">Note to Driver</label>
                                <input type="text" placeholder="Enter Note"
                                    class="px-4 py-2.5 bg-white border border-gray-400 text-slate-900 w-full text-sm rounded-md focus:outline-blue-600" />
                            </div>
                            
                        </div>
                    </div>

                    <div class="mt-12">
                        <h2 class="text-xl text-slate-900 font-semibold mb-6">Payment</h2>
                        <div class="grid gap-4 lg:grid-cols-2">
                            <div class="bg-gray-100 p-4 rounded-md border border-gray-300 max-w-sm">
                                <div>
                                    <div class="flex items-center">
                                        <input type="radio" name="method" class="w-5 h-5 cursor-pointer" id="card" checked />
                                        <label for="card" class="ml-4 mb-4 flex gap-2 cursor-pointer">
                                            <p class="mt-4 text-sm text-slate-500 font-medium">Cash On Delivery</p>
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