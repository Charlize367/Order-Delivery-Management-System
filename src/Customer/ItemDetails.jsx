import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'

const ItemDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
    const param = useParams();
    const [item, setItem] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const user_ID = localStorage.getItem('user_ID');
    const [quantity, setQuantity] = useState(1);
    const customer = localStorage.getItem('username');
    const [showPopup, setShowPopup] = useState(false);
    
    
    console.log(item);

    

    const fetchCatalogByCategory = async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/catalog/${param.id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          setItem(response.data);
          } catch {
            console.error("Error");
          
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
              
                const response = await axios.post(`${API_BASE_URL}/basket/users/${user_ID}/catalog/${item.catalogId}`, postData, {
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

      {/* <div className="item-details">
        <img className="itemPicture" src={`${API_BASE_URL}/images/${item.catalog_image}`}/>
        <div className="details">
            <h2 className="itemName">{item.catalogName}</h2> <p className="itemPrice"> PHP {item.catalog_price}</p> 


           <hr />
            <p className="itemDesc">{item.catalog_description}</p>
            

            <div className="item_buttons">
              <button className="addToCart" onClick={addToBasket}>Add to Basket</button>

              {showPopup && (
            <div className="basket-popup">
              Item added to basket!
            </div>
              )}
              <div className="quantityButton">
                <button className="minusQuantity" onClick={minusFromQuantity}>-</button>
                <div className="quantity"><h3 className="quantity-text">{quantity}</h3></div>
                <button className="addQuantity" onClick={addToQuantity}>+</button>
              </div>
            </div>
      </div>
        
     </div> */}

     <div class="p-4 m-10 bg-gray-100">
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

          <div class="w-full">
            <div>
              <h3 class="text-lg sm:text-xl font-semibold text-slate-900">{item.catalogName}</h3>
              
              <div class="mt-4">
                <p class="text-slate-500 mt-1 text-sm">{item.catalog_description}</p>
              </div>

              <div class="flex items-center flex-wrap gap-2 mt-6">
                
                <h4 class="text-purple-800 text-2xl sm:text-3xl font-semibold">PHP {item.catalog_price}</h4>
                
              </div>

             
            </div>

            <hr class="my-6 border-gray-300" />

            <div>
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

              <div class="mt-4 flex flex-wrap gap-4">
                
                <button onClick={addToBasket} type="button"
                  class="px-4 py-3 w-[45%] cursor-pointer border border-purple-600 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium">Add to basket</button>
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