import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ItemCard = ({items : {catalogId, catalog_name, catalog_price, catalog_description, catalog_image} } ) => {

   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');



  return (
    <div className="itemCard">
      <Link to = {`/food_details/${catalogId}`}>
        <img className="catalogImage" src={`http://localhost:8083/images/${catalog_image}`}/>
        <p className="catalogName">{catalog_name}</p>
        <p className="catalogPrice">PHP {catalog_price}</p>
      </Link>
    </div>
    
  )
}

export default ItemCard