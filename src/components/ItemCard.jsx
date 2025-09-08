import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ItemCard = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image} } ) => {

   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');



  return (
    <div className="itemCard">
      <Link to = {`/food_details/${catalogId}`}>
        <img className="catalogImage" src={`${API_BASE_URL}/images/${catalog_image}`}/>
        <p className="catalogName">{catalogName}</p>
        <p className="catalogPrice">PHP {catalog_price}</p>
      </Link>
    </div>
    
  )
}

export default ItemCard