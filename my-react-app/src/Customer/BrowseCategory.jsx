import React from 'react'
import Header from '../components/CustomerHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import BrowseCategoryCard from '../components/BrowseCategoryCard.jsx'
import { useNavigate, Link } from 'react-router-dom';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const BrowseCategory = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);
  const navigate = new useNavigate();
  const [query, setQuery] = useState("");
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");

    const fetchCategories = async () => {
          try {
            const response = await axios.get(`${API_URL}/categories/all`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         
            setCategories(response.data);
            
          
          } catch (error){
            console.error("Error");
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          }
        }

        useEffect(() => {
        fetchCategories();
    }, []);

    console.log(categories);

    const searchCatalog = (e) => {
      e.preventDefault();
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }


  return (
    <div className="body">
      <Header />
     <section className="bg-[url('./main-hero.jpg')] bg-cover bg-center bg-no-repeat lg:grid lg:h-screen lg:place-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backgroundBlendMode: 'darken' }}>
  <div className="mx-auto w-screen max-w-7xl px-4 py-15 sm:px-6 sm:py-24 lg:px-8 lg:py-30">
    
    <div className="relative z-10 mx-auto max-w-prose text-center">
      
      <h1 className="relative z-10 text-4xl text-white font-bold sm:text-5xl">
        Deliciousness at your doorstep.
      </h1>

      <p className="relative z-10 mt-4 text-base text-pretty text-white sm:text-lg/relaxed">
        Explore a menu full of fresh, flavorful dishes crafted to satisfy your cravings, delivered straight to you.
      </p>

      <form class="max-w-md mt-6 sm:mt-8 mx-auto">   
    <label for="search" class="block mb-2.5 text-sm font-medium text-heading sr-only ">Search</label>
    <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
        </div>
        <input type="search" id="search" value={query} 
          onChange={(e) => setQuery(e.target.value)} class="block w-full p-5 ps-9 bg-white  text-heading text-sm rounded-4xl focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Search" required />
        <button type="button" onClick={searchCatalog} class="absolute end-2 bottom-3 text-white bg-gradient-to-r rounded-2xl from-[#56C789] to-[#096E22] hover:bg-brand-strong box-border  focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none">Search</button>
    </div>
</form>

    
    </div>
  </div>
</section>
<div>

  {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCategories} currentPage={currentPage} />
  )}

  {categories.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no categories found.</p>
          )}

          <ul class="grid grid-cols-2 md:grid-cols-3 gap-4 m-10">
          {categories.map((category) => (
             
             
            
            <BrowseCategoryCard key={category.categoryId} category={category}/>
            
          ))
          }
          </ul>
       
          
        </div>
    </div>
    
  )
}

export default BrowseCategory