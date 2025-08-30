import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'

const Checkout = () => {
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
            const response = await axios.get(`http://localhost:8083/basket/users/${user_ID}`, {
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

  useEffect(() => {
        getAllBasketItems();
    }, []);

    const total = items.reduce((sum, basket) => sum + basket.subtotal, 0);


  

    const placeOrder = async () => {
     
        try{
            const response = await axios.post(`http://localhost:8083/orders/users/${user_ID}`, orderData, {
                headers: {
                    'Authorization' : `Bearer ${token}`,
                    'Content-Type' : 'application/json'

                }})

                navigate('/order', {state: {showPopup: true}});
            } catch {
                console.log("Error");
            }
        }
    

  return (
    <div className="body">
      <Header />
    <div className="summary-container">
        <h2 className="summary-txt">Order Summary</h2>
        <p className="checkout-item-txt">Items</p>
        <ul className="item-summary">
            {items.map(b => (
              <li className="item-summary-details">
                <img className="summary-img" src={`http://localhost:8083/images/${b.catalog.catalog_image}`}/>
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
    </div>

    
   
    </div>
  )
}

export default Checkout