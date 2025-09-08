import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const BrowseCategoryCard = ({category : {category_ID, category_name, category_image}}) => {

  const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');

  
  
  return (

    <div className="categories">
    <div className="category_card">
        


        <Link to = {`/browse_food/${category_ID}/${category_name}`}>
        <img className="category_image" src={`${API_BASE_URL}/images/${category_image}`}/>
       
        <p className="overlay">{category_name} 

       </p>

        </Link>
       
      
    </div>
    
    </div>
  )
}

export default BrowseCategoryCard