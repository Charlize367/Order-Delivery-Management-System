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
           <article className="relative overflow-hidden rounded-lg shadow-sm transition hover:shadow-lg">
     <img alt="" src={`https://${bucket}.s3.${region}.amazonaws.com/${category_image}`} className="absolute inset-0 h-full w-full object-cover"/>
   
     <div className="relative bg-linear-to-t from-gray-900/50 to-gray-900/25 pt-32 sm:pt-48 lg:pt-64">
       <div className="p-4 sm:p-6">
         <h1 className="text-white text-2xl font-bold ">{category_name} </h1>
         
       </div>
     </div>
   </article>
   </Link>
   </div>
   </div>
   </div>
  )
}

export default BrowseCategoryCard