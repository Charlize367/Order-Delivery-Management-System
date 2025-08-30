import React from 'react'
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Header from '../components/CustomerHeader';
import { useState, useEffect } from 'react'



const Basket = () => {

  const token = localStorage.getItem('jwtToken');
  const user_ID = localStorage.getItem('user_ID');
  const [basket, setBasket] = useState([]);
  const navigate = new useNavigate();
  


  console.log(user_ID);
  const getAllBasketItems = async () => {
    try {
            const response = await axios.get(`http://localhost:8083/basket/users/${user_ID}`, {
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

        const response = await axios.put(`http://localhost:8083/basket/${basket_ID}/quantity/${quantity}`, {}, {
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
          const response = await axios.delete(`http://localhost:8083/basket/users/${user_ID}/catalog/${catalog_ID}`, {
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

        navigate(`/checkout/${user_ID}`);

      }
    



  return (
    <div className="body">
      <Header />
      <div className="basket-table">
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
            {basket.map(b => (
              <tr key={b.basketId}>
                <td className="basket-td">{b.catalog.catalogName}</td>
                <td className="image-td"> <img className="basketItemImg" src={`http://localhost:8083/images/${b.catalog.catalog_image}`}/></td>
                <td className="quantity-td"><button className="minusBasketQuantity" onClick={() => updateQuantity(b.basketId, b.quantity - 1)}>-</button><div className="basket-quantity">{b.quantity}</div>
                <button className="addBasketQuantity" onClick={() => updateQuantity(b.basketId, b.quantity + 1)}>+</button></td>
                <td className="price-td">PHP {b.subtotal}</td>
                <td className="remove-td"><button className="deleteBasketBtn" onClick={() => deleteBasketItem(b.catalog.catalogId)}><img src="./delete-icon.svg" className="deleteBasket"/></button></td>
                </tr>
           ))}
            </tbody>
            
          
        </table>

        <div className="total-sticky">
          <p className="total-text">Total : PHP {total}</p>

      <button className="checkoutBtn" onClick={goToCheckout}>
        Checkout
      </button>
        </div>
      </div>

     
      </div>
  )
}

export default Basket