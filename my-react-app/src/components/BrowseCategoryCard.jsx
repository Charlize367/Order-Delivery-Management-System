import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const BrowseCategoryCard = ({category : {categoryId, category_name, category_image}}) => {
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;

  return (

   <div className="categories">
       <div className="h-auto max-w-full rounded-base">
           
           <div className="relative">
           <Link to = {`/browse_food/${categoryId}/${category_name}`}>
          <article className="group relative overflow-hidden h-70 rounded-lg shadow-sm transition duration-300 hover:shadow-lg">
     <img alt="" src={`https://${bucket}.s3.${region}.amazonaws.com/${category_image}`} className="absolute inset-0 h-full w-full transition-transform duration-700 object-cover"/>
   
    <div className="absolute inset-0 bg-black opacity-30 
                  transition-opacity duration-500 ease-out
                  group-hover:opacity-75">
  </div>
        <div className="relative z-10 flex items-end h-full p-6">
         <h1 className="text-white text-2xl font-bold ">{category_name} </h1>
         
      
     </div>
   </article>
   </Link>
   </div>
   </div>
   </div>
  )
}

export default BrowseCategoryCard