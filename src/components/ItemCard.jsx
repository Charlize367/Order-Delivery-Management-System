import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ItemCard = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image} } ) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');



  return (
    <div className="itemCard">
      <Link to = {`/food_details/${catalogId}`}>
        

  <div  class="group relative block overflow-hidden">
  

  <img src={`${API_BASE_URL}/images/${catalog_image}`} alt="" class="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"/>

  <div class="relative border border-gray-100 bg-white p-6">
    <span class="bg-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap"> New </span>

    <h3 class="mt-4 text-lg font-medium text-gray-900">{catalogName}</h3>

    <p class="mt-1.5 text-sm text-gray-700">PHP {catalog_price}</p>

    <form class="flex mt-4 space-x-10">
      <button class="block w-full rounded-sm bg-yellow-400 p-4 text-sm font-medium transition hover:scale-105">
        Add to Cart
      </button>
    </form>
  </div>
</div>

      </Link>
    </div>
    
  )
}

export default ItemCard