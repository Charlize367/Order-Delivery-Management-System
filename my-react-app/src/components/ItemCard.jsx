import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ItemCard = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image} } ) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');



  return (
    <div className="itemCard">
      <Link to = {`/food_details/${catalogId}`}>
        

  <div  class="group relative block rounded-2xl overflow-hidden">
  

  <img src={`${API_BASE_URL}/images/${catalog_image}`} alt="" class="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"/>

  <div class="relative  bg-[#282928] p-6">
    <span class="bg-gradient-to-r from-[#56C789] to-[#096E22] px-3 py-1.5  text-xs font-medium whitespace-nowrap"> New </span>

    <h3 class="mt-4 text-lg font-medium text-white">{catalogName}</h3>

    <p class="mt-1.5 text-sm text-gray-300">PHP {catalog_price}</p>

    <form class="flex mt-4 space-x-10">
      <button class="block w-full rounded-sm text-white bg-gradient-to-r from-[#56C789] to-[#096E22] p-4 text-sm font-medium transition hover:scale-105">
        View more
      </button>
    </form>
  </div>
</div>

      </Link>
    </div>
    
  )
}

export default ItemCard