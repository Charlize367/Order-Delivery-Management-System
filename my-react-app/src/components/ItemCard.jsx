import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import RateLimitPopup from '../components/RateLimitPopup';

const ItemCard = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image} } ) => {
  const user_ID = localStorage.getItem('user_ID');
  const API_URL = import.meta.env.VITE_API_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const token = localStorage.getItem('jwtToken');
  const [showPopup, setShowPopup] = useState(false);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();


  

   const goToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
        action: "ADD_TO_BASKET"
      }
    })
  }


  const goToRegister = () => {
    navigate("/register", {
      state: {
        from: location.pathname + location.search,
        action: "ADD_TO_BASKET"
      }
    })
  }


  
    const addToBasket = async (event) => {
        if (event) event.preventDefault();

        if(!token) {
          setShowLoginPopup(true);
          return;
        }

        const postData = {
        basket_ID: null,
        customer: null,
        catalog: null,
        quantity: 1,
        subtotal: catalog_price
    }

   
      
            try {
              
                const response = await axios.post(`${API_URL}/basket/users/${user_ID}/catalog/${catalogId}`, postData, {
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

  useEffect(() => {
    if(location.state?.action === "ADD_TO_BASKET") {
      addToBasket(null);
      location.state.action = null;
  
    }
  }, [location.state])

  return (
    <div className="itemCard group relative block rounded-2xl overflow-hidden bg-[#282928] shadow-md hover:shadow-xl transition-shadow duration-300">
      
      {showRateLimitPopup && (
        <RateLimitPopup
          error={error}
          retryTime={retryTime}
          setRetryTime={setRetryTime}
          setShowPopup={setShowRateLimitPopup}
          showPopup={showRateLimitPopup}
        />
      )}

     
      {showPopup && (
        <div className="fixed top-5 right-5 flex w-full max-w-xs p-4 text-gray-500 bg-none rounded-lg" role="alert">
          <div className="flex items-center w-full p-4 text-white bg-gray-800 rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-8 h-8 text-green-500 bg-green-100 rounded-lg">
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
            </div>
            <div className="ms-3 text-sm font-normal">Item added to basket.</div>
          </div>
        </div>
      )}

      {showLoginPopup && (
         <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xs rounded-lg bg-[#1e1e1e] px-6 py-5 text-gray-200">
        
        <h2 className="text-center text-base font-semibold">
          Login required
        </h2>

        <p className="mt-1 mb-4 text-center text-sm text-gray-400">
          Please log in or create an account to add items to your cart
        </p>

        <div className="space-y-2">
          <button
            onClick={() => goToLogin()}
            className="w-full cursor-pointer rounded-md bg-gradient-to-r from-[#56C789] to-[#096E22] py-2 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Log in
          </button>

          <button
            onClick={() => goToRegister()}
            className="w-full cursor-pointer rounded-md border border-[#56C789] py-2 text-sm text-[#56C789] hover:bg-[#56C789]/10 transition"
          >
            Create account
          </button>
        </div>

        <button
          onClick={() => setShowLoginPopup(false)}
          className="mt-3 w-full cursor-pointer text-xs text-gray-400 hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
      )}

    
      <Link to={`/food_details/${catalogId}`}>
        <img
          src={`https://${bucket}.s3.${region}.amazonaws.com/${catalog_image}`}
          alt={catalogName}
          className="h-50 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-60"
        />
      </Link>

    
      <div className="p-6">
        <h3 className="text-lg font-medium text-white">{catalogName}</h3>
        <p className="mt-1.5 text-sm text-gray-300">PHP {catalog_price}</p>

      
        <div className="mt-4 flex gap-4">
         
          <Link to={`/food_details/${catalogId}`} className="flex-1">
            <button className="w-full rounded-lg bg-gradient-to-r cursor-pointer from-green-500 to-green-700 text-white p-3 text-sm font-semibold transition transform hover:scale-105 hover:from-green-600 hover:to-green-800">
              View More
            </button>
          </Link>

        
          <button
  type="button"
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    addToBasket(event);
  }}
  className="flex-1 cursor-pointer rounded-lg border border-green-500 text-green-500 p-3 text-sm hover:bg-green-500 hover:text-white transition"
>
  Add to Basket
</button>

        </div>

      </div>
    </div>
  )
}

export default ItemCard