import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect, useRef } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';
import TippingSelector from '../components/TippingSelector';
import DiscountSelector from '../components/DiscountSelector';
import PromoCodes from '../Admin/PromoCodes';
import TimeSelector from '../components/ScheduledTimeSelector';
import MapLocationSelector from './MapLocationSelector';

const Checkout = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [items, setItems] = useState([]);
  const didRun = useRef(false);
  const navigate = useNavigate();
  const [retryTime, setRetryTime] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [tip, setTip] = useState(0.0);
  const [discounts, setDiscounts] = useState([]);
  const [discount, setDiscount] = useState([]);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [guestBasket, setGuestBasket] = useState(() => {
          try {
      const basketString = localStorage.getItem('basket');
      if (!basketString || basketString === "undefined") {
        return [];
      }
      return JSON.parse(basketString);
    } catch (err) {
      console.warn("Invalid basket in localStorage, resetting to empty array", err);
      return [];
    }
      })

  const orderData = {
    order_address: deliveryLocation?.address,
    destination_lat: deliveryLocation?.lat,
    destination_lang: deliveryLocation?.lng,
    payment_method: paymentMethod,
    tip: tip,
    promoCodeId: discount?.promoCodeId ?? null,
    scheduledDeliveredTime: scheduleTime
  }

  console.log("SELECTED DELIVERY LOCATION: ", deliveryLocation);
  const addTempBasketToBasket = async () => {
        
    let postData = []
    let newBasket = {}
      for (const basket of guestBasket) {
        newBasket = {
          basket_ID: null,
          userId: Number(user_ID),
          catalogId: basket.catalog.catalogId,
          quantity: basket.quantity,
          subtotal: basket.subtotal
        }
         postData.push(newBasket);
      }

     
     
            try {
              
                const response = await axios.post(`${API_URL}/basket/batchBasket`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                
               
                console.log(response);
                console.log(postData);
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

    console.log("TIP: ", tip)

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
   if (didRun.current) return;
   didRun.current = true;
 
   const syncBasket = async () => {
     if (token && guestBasket.length > 0) {
       const success = await addTempBasketToBasket();
       if (success) {
         localStorage.removeItem('basket');  
         setGuestBasket([]);   
       }
     }
 
     await getAllBasketItems();
   };
 
   syncBasket();
 }, []);

    const total = items.reduce((sum, basket) => sum + basket.subtotal, 0);

    console.log("Order data: ", orderData);

  const placeOrder = async() => {

    if(!deliveryLocation) {
        window.alert("Address is required.");
        return; // also add this — currently it doesn't stop execution without it
    }
    try {
      const response = await axios.post(`${API_URL}/orders/users/${user_ID}`, orderData, {
        headers : {
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        }
      })

      if (response.data.checkoutUrl) {
        // credit card — redirect to Stripe
        window.location.href = response.data.checkoutUrl;
      } else {
        // cash — no checkout needed, go straight to confirmation
        navigate('/order', {state: {showPopup: true}});
      }
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
   

  const getAllPromoCodes = async () => {
    try {
           const response = await axios.get(`${API_URL}/promoCode/all`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log("Promo codes response: ", response);
          setDiscounts(response.data);
         
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
          getAllPromoCodes();
      }, []);
    

  return (
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />

      <div className="bg-[#F7F1E8]">
        <div className="flex h-full max-md:flex-col gap-12 max-lg:gap-4">
          <div className="border-r border-[#E7DCC9] bg-white p-10 md:sticky md:top-0 md:h-screen md:min-w-[420px] lg:min-w-[480px]">
            <div className="relative h-full">
              <div className="md:h-screen md:overflow-auto">
                <h2 className="mb-6 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Your order</h2>
                <div className="space-y-4">
                  {items.map(b => {
  const item = b.combo || b.catalog;
  const isCombo = !!b.combo;

  return (
    <div
      key={isCombo ? b.combo.comboId : b.catalog.catalogId}
      className="flex items-start gap-4 rounded-lg border border-[#E7DCC9] bg-[#FBF6EE] p-3"
    >
       {!isCombo && (
      <div className="flex h-20 w-20 shrink-0 rounded-md bg-white p-2">

     
        <img
          src={`https://${bucket}.s3.${region}.amazonaws.com/${item?.catalog_image}`}
          className="w-full object-contain"
          alt={isCombo ? item.name : item.catalogName}
        />
       
      </div>
                  )}

      <div className="w-full">
        <h3 className="text-sm font-semibold text-[#3B2A20]">
          {isCombo ? item.name : item.catalog_name}
        </h3>

        <ul className="mt-2 space-y-1.5 text-xs text-[#8A7862]">
          <li className="flex flex-wrap gap-4">
            Quantity
            <span className="ml-auto font-medium text-[#3B2A20]">
              {b.quantity}
            </span>
          </li>

          <li className="flex flex-wrap gap-4">
            Total Price
            <span className="ml-auto font-semibold text-[#3B2A20]">
              PHP {b.subtotal}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
})}

                  {showRateLimitPopup && (
                    <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={getAllBasketItems} currentPage={currentPage} />
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center my-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
                        </div>
                    )}


                </div>
                <hr className="my-8 border-[#E7DCC9]" />
                <div>
                  <ul className="space-y-4 font-medium text-[#3B2A20]">
                    <li className="flex flex-wrap gap-4 text-[15px] font-semibold">Total <span className="ml-auto text-[#A65A34]">PHP {total}</span></li>
                  </ul>

                  <div className="mt-8">
                    <button onClick={placeOrder} type="button" className="w-full cursor-pointer rounded-md bg-[#A65A34] px-4 py-2.5 text-sm font-medium tracking-wide text-white transition hover:bg-[#8B4A2A]">Complete Purchase</button>
                  </div>

                  
                </div>
              </div>
            </div>
          </div>

         

          <div className="h-max w-full max-w-4xl rounded-md px-4 py-16 max-md:-order-1 md:py-20">
            <form>
              <div>
                <h2 className="mb-6 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Delivery Details</h2>
                <div className="grid gap-y-6 gap-x-4 lg:grid-cols-1">
                  

                  <MapLocationSelector
            value={{ lat: 14.5995, lng: 120.9842 }} // optional initial point
            onChange={(loc) => setDeliveryLocation(loc)}
            
          />
                </div>
              </div>

              <div className="mt-12">
                <h2 className="mb-6 font-['Fraunces',serif] text-xl font-semibold text-[#3B2A20]">Payment</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div
                    className={`max-w-sm rounded-md border-2 bg-white p-4 shadow-sm transition-colors ${
                      paymentMethod === "cash" ? "border-[#A65A34]" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="method"
                        value="cash"
                        id="method-cash"
                        checked={paymentMethod === "CASH"}
                        onChange={() => setPaymentMethod("CASH")}
                        className="h-5 w-5 cursor-pointer accent-[#A65A34]"
                      />
                      <label htmlFor="method-cash" className="ml-4 flex cursor-pointer gap-2">
                        <p className="text-sm font-medium text-[#3B2A20]">Cash On Delivery</p>
                      </label>
                    </div>
                  </div>

                  <div
                    className={`max-w-sm rounded-md border-2 bg-white p-4 shadow-sm transition-colors ${
                      paymentMethod === "CREDIT_CARD" ? "border-[#A65A34]" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="method"
                        value="stripe"
                        id="method-stripe"
                        checked={paymentMethod === "CREDIT_CARD"}
                        onChange={() => setPaymentMethod("CREDIT_CARD")}
                        className="h-5 w-5 cursor-pointer accent-[#A65A34]"
                      />
                      <label htmlFor="method-stripe" className="ml-4 flex cursor-pointer gap-2">
                        <p className="text-sm font-medium text-[#3B2A20]">Stripe</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>


            </form>

             <TippingSelector tip={tip} setTip={setTip} />

             <DiscountSelector subtotal={total}  discounts={discounts} discount={discount}  setDiscount={setDiscount} />
          
              <TimeSelector setScheduledTime={setScheduleTime} scheduledTime={scheduleTime} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default Checkout