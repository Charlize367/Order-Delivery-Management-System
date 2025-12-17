import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'



const Basket = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [basket, setBasket] = useState([]);
  const navigate = new useNavigate();
  


  console.log(user_ID);
  const getAllBasketItems = async () => {
    try {
            const response = await axios.get(`${API_BASE_URL}/basket/users/${user_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          const basketData = response.data;
          const sortedBasket = basketData.sort(
      (a, b) => a.basketId - b.basketId
    );

    setBasket(sortedBasket);


          } catch {
            console.error("Error");
            console.log(response);
          
          }
  }

  useEffect(() => {
        getAllBasketItems();
    }, []);


    const updateQuantity = async(basket_ID, quantity) => {
      try {
    
        if (quantity < 1) return;  

        const response = await axios.put(`${API_BASE_URL}/basket/${basket_ID}/quantity/${quantity}`, {}, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

         setBasket(prevBasket =>
  prevBasket.map(baskets =>
    baskets.basketId === basket_ID
      ? { ...baskets, quantity: response.data.quantity, subtotal : response.data.catalog.catalog_price}
      : baskets
  )

);
getAllBasketItems();
        }
        catch{
          console.log("Failed to updateQuantity")
          console.log(postData);
        }
      }
      
      const total = basket.reduce((sum, baskets) => sum + baskets.subtotal, 0);
        
      const deleteBasketItem = async(catalog_ID) => {
        
        try{
          const response = await axios.delete(`${API_BASE_URL}/basket/users/${user_ID}/catalog/${catalog_ID}`, {
          headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         
getAllBasketItems();
        } catch {
          console.log("Failed to delete");
        }
      }

      const goToCheckout = () => {

      if (basket == 0) {
        window.alert("Please add items to basket first");
      } else {
        navigate(`/checkout/${user_ID}`);
      }

      }
    



  return (
    <div className="body">
      <Header />
      {/* <div className="basket-table">
        <table className="b-table">
          <thead>
            <tr>
              <th className="basket-th">Item</th>
              <th className="basket-th">Image</th>
              <th className="basket-th">Quantity</th>
              <th className="basket-th">Total Price</th>
              <th className="basket-th">Remove</th>
            </tr>
            </thead>
            <tbody>
           
              <tr key={b.basketId}>
                <td className="basket-td">{b.catalog.catalogName}</td>
                <td className="image-td"> <img className="basketItemImg" src={`${API_BASE_URL}/images/${b.catalog.catalog_image}`}/></td>
                <td className="quantity-td"><button className="minusBasketQuantity" onClick={() => updateQuantity(b.basketId, b.quantity - 1)}>-</button><div className="basket-quantity">{b.quantity}</div>
                <button className="addBasketQuantity" onClick={() => updateQuantity(b.basketId, b.quantity + 1)}>+</button></td>
                <td className="price-td">PHP {b.subtotal}</td>
                <td className="remove-td"><button className="deleteBasketBtn" onClick={() => deleteBasketItem(b.catalog.catalogId)}><img src="./delete-icon.svg" className="deleteBasket"/></button></td>
                </tr>
           
            </tbody>
            
          
        </table>

        <div className="total-sticky">
          <p className="total-text">Total : PHP {total}</p>

      <button className="checkoutBtn" onClick={goToCheckout}>
        Checkout
      </button>
        </div>
      </div> */}

      <section class=" py-8 antialiased md:py-16">
  <div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Shopping Cart</h2>

    <div class="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
      <div class="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
        <div class="space-y-6">
           {basket.map(b => (
          <div class="rounded-lg border border-[#2a2a2a] bg-[#232323] p-4 shadow-sm  md:p-6">
            <div class="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
              <a href="#" class="shrink-0 md:order-1">
                <img class="h-20 w-20 dark:hidden" src={`${API_BASE_URL}/images/${b.catalog.catalog_image}`} alt="imac image" />
                <img class="hidden h-20 w-20 dark:block" src={`${API_BASE_URL}/images/${b.catalog.catalog_image}`} alt="imac image" />
              </a>

              <label for="counter-input" class="sr-only">Choose quantity:</label>
              <div class="flex items-center justify-between md:order-3 md:justify-end">
                <div class="flex items-center">
                  <button onClick={() => updateQuantity(b.basketId, b.quantity - 1)} type="button" id="decrement-button" data-input-counter-decrement="counter-input" class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
                    <svg class="h-2.5 w-2.5 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h16" />
                    </svg>
                  </button>
                  <input type="text" value={b.quantity} id="counter-input" data-input-counter class="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white" placeholder="" required />
                  <button onClick={() => updateQuantity(b.basketId, b.quantity + 1)} type="button" id="increment-button" data-input-counter-increment="counter-input" class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
                    <svg class="h-2.5 w-2.5 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16" />
                    </svg>
                  </button>
                </div>
                <div class="text-end md:order-4 md:w-32">
                  <p class="text-base font-bold text-gray-900 dark:text-white">PHP {b.subtotal}</p>
                </div>
              </div>
              

              <div class="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                <a href="#" class="text-base font-medium text-gray-900 hover:underline dark:text-white">{b.catalog.catalogName}</a>

                <div class="flex items-center gap-4">
                  

                  <button type="button" class="inline-flex mt-3 items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500">
                    <svg class="me-1.5 h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                    </svg>
                    Remove
                  </button>
                </div>
                
              </div>
            </div>
          </div>
          
             ))}
         </div>
      </div>

      <div class="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
        <div class="space-y-4 rounded-lg border border-[#2a2a2a] bg-[#232323] p-4 shadow-sm  sm:p-6">
          <p class="text-xl font-semibold text-gray-900 dark:text-white">Order summary</p>

          <div class="space-y-4">
            

            <dl class="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
              <dt class="text-base font-bold text-gray-900 dark:text-white">Total</dt>
              <dd class="text-base font-bold text-gray-900 dark:text-white">PHP {total}</dd>
            </dl>
          </div>

          <button onClick={goToCheckout} class="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Proceed to Checkout</button>

          <div class="flex items-center justify-center gap-2">
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400"> or </span>
            <Link to ="/browse" title="" class="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500">
              Continue Shopping
              <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
              </svg>
            </Link>
          </div>
        </div>

      
      </div>
    </div>
  </div>
</section>

     
      </div>
  )
}

export default Basket