import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect, useRef } from 'react'
import RateLimitPopup from '../components/RateLimitPopup';

const ItemDetails = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const region = import.meta.env.VITE_AWS_REGION;
    const param = useParams();
    const [item, setItem] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [quantity, setQuantity] = useState(1);
    const customer = localStorage.getItem('username');
    const [showPopup, setShowPopup] = useState(false);
    const [retryTime, setRetryTime] = useState(0);
    const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const hasResumedRef = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    if (location.state?.popup) {
     
      setShowLoginSuccessPopup(true);
  
      setTimeout(() => setShowLoginSuccessPopup(false), 3000);
    }
  }, []);


    const goToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
        action: "ADD_TO_BASKET",
        quantity: quantity,
        catalogId: param.id
      }
    })
  }
console.log(quantity);

  const goToRegister = () => {
    navigate("/register", {
      state: {
        from: location.pathname + location.search,
        action: "ADD_TO_BASKET",
        quantity: quantity,
        catalogId: param.id
      }
    })
  }

    

    const fetchCatalogByCategory = async () => {

      let id = param.id;

      if(!param.id) {
        id = location.state?.catalogId;
      }
          try {
            const response = await axios.get(`${API_URL}/catalog/${id}`, {
              headers: {
                       
                        'Content-Type': 'application/json'
                    }});

          console.log(response);
          setItem(response.data);
          setIsLoading(false);
          } catch (error) {
            console.error(error);
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



    
    

     const addToBasket = async (event, overrideQty) => {
        if (event) event.preventDefault();

        if(!token) {
          setShowLoginPopup(true);
          return;
        }

        let id = param.id;
        let finalQty = quantity;

      if(!param.id) {
        id = location.state?.catalogId;
        
      }

      if(overrideQty) finalQty = overrideQty;

        const postData = {
        basket_ID: null,
        customer: null,
        catalog: null,
        quantity: finalQty,
        subtotal: item.catalog_price * finalQty
    }
      
            try {
              
                const response = await axios.post(`${API_URL}/basket/users/${user_ID}/catalog/${id}`, postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);

                setQuantity(1);
                
               
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

        useEffect(() => {
        if (
          location.state?.action === "ADD_TO_BASKET" &&
          !hasResumedRef.current
        ) {
          hasResumedRef.current = true;

          addToBasket(null, location.state?.quantity);
          navigate(location.pathname, { replace: true });
        }
      }, []);
console.log(location.state?.quantity);
  return (
    <div className="min-h-screen bg-[#1f1f1f] flex flex-col">
  <Header />
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
        <div className="fixed top-5 right-5 z-99 flex w-full max-w-xs p-4 text-gray-900 bg-none rounded-lg" role="alert">
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
{isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
    )}
  <div className="flex-1 flex items-center justify-center">

    
    <div className="max-w-5xl w-full p-8 lg:p-16 bg-[#282928] rounded-2xl shadow-lg mt-5">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        
        <div className="w-full">
          <img
            src={`https://${bucket}.s3.${region}.amazonaws.com/${item.catalog_image}`}
            alt={item.catalogName}
            className="w-full rounded-xl object-cover object-center shadow-md"
          />
        </div>

        
        <div className="w-full flex flex-col gap-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white">{item.catalogName}</h1>
          <p className="text-gray-300 text-sm">{item.catalog_description}</p>

          <h2 className="text-[#56C789] text-2xl font-semibold">PHP {item.catalog_price}</h2>

          <hr className="border-gray-600 my-4" />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">
              <button onClick={minusFromQuantity} className="text-white px-2 cursor-pointer py-1 hover:bg-gray-700 rounded">
                -
              </button>
              <span className="text-white font-semibold text-lg w-6 text-center">{quantity}</span>
              <button onClick={addToQuantity} className="text-white  cursor-pointer px-2 py-1 hover:bg-gray-700 rounded">
                +
              </button>
            </div>

          <button
  onClick={addToBasket}
  className="flex-1 min-w-[150px] px-6 py-2 cursor-pointer
             bg-gradient-to-r from-emerald-600 to-green-700
             text-white font-medium rounded-lg
             transition-all duration-300 ease-out
             hover:from-emerald-500 hover:to-green-600
             hover:scale-[1.03]
             active:scale-[0.98]"
>
  Add to Basket
</button>


          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}

export default ItemDetails