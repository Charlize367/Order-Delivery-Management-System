import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'

const ItemDetails = () => {

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
            const response = await axios.get(`http://localhost:8083/catalog/${param.id}`, {
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
              
                const response = await axios.post(`http://localhost:8083/basket/users/${user_ID}/catalog/${item.catalogId}`, postData, {
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

      <div className="item-details">
        <img className="itemPicture" src={`http://localhost:8083/images/${item.catalog_image}`}/>
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
        
     </div>
    </div>
  )
}

export default ItemDetails