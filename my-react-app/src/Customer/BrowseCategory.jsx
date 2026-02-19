import React from 'react'
import Header from '../components/CustomerHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import BrowseCategoryCard from '../components/BrowseCategoryCard.jsx'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import RateLimitPopup from '../components/RateLimitPopup.jsx';
import { useAuth } from '../Auth/AuthContext.jsx';
import ItemCard from '../components/ItemCard.jsx';

const BrowseCategory = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);
  const navigate =  useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(8);
  const [item, setItem] = useState([]);
  

    const fetchCategories = async () => {
          try {
            const response = await axios.get(`${API_URL}/categories/all`, {
              headers: {
                        
                        'Content-Type': 'application/json'
                    }});
         
            setCategories(response.data);
            setIsLoading(false);
          
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


    const fetchCatalog = async (page = 0) => {
          try {
            const response = await axios.get(`${API_URL}/catalog?page=${page}&size=${pageSize}`, {
              headers: {
                        
                        'Content-Type': 'application/json'
                    }});


          setItem(response.data.content);
          setCurrentPage(response.data.number);
          setTotalPages(response.data.totalPages);
          setIsLoading(false);
          } catch (error) {
            console.error(error);
            if (error.response?.data === "Too many requests" || error.response?.status === 429) {
                const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
                setRetryTime(retryAfter);
                setError("Too Many Requests");
                setShowRateLimitPopup(true);
          
          }
          
          }
        }

    useEffect(() => {
        fetchCatalog(0);
    }, []);

    console.log(item);

    const searchCatalog = (e) => {
      e.preventDefault();
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }


  return (
    <div className="body">
      <Header />
     <section  className=" bg-cover bg-center bg-no-repeat lg:grid lg:h-[500px] lg:place-content-center" style={{ backgroundImage: `url('/main-hero.jpg')`, backgroundColor: 'rgba(0,0,0,0.5)', backgroundBlendMode: 'darken' }}>
  <div className="mx-auto w-screen max-w-7xl px-4 py-15 sm:px-6 sm:py-24 lg:px-8 lg:py-30">
    
    <div className="relative z-10 mx-auto max-w-prose text-center">
      
      <h1 className="relative z-10 text-4xl text-white font-bold sm:text-5xl">
        Deliciousness at your doorstep.
      </h1>

      <p className="relative z-10 mt-4 text-base text-pretty text-white sm:text-lg/relaxed">
        Explore a menu full of fresh, flavorful dishes crafted to satisfy your cravings, delivered straight to you.
      </p>

      <form onSubmit={searchCatalog} class="max-w-md mt-6 sm:mt-8 mx-auto">   
    <label for="search" class="block mb-2.5 text-sm font-medium text-heading sr-only ">Search</label>
    <div class="relative">
        <div class="absolute text-black inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
        </div>
        <input type="search" id="search" value={query} 
          onChange={(e) => setQuery(e.target.value)} class="block w-full p-5 ps-9 bg-white  text-heading text-sm rounded-4xl focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Search" required />
        <button type="submit"  class="absolute cursor-pointer end-2 bottom-3 text-white bg-[#56C789] hover:bg-[#38A45C] text-white rounded-lg  box-border  focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none">Search</button>
    </div>
</form>

    
    </div>
  </div>
</section>
<div>

  {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCategories} currentPage={currentPage} />
  )}


  {!isLoading && categories.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no categories found.</p>
          )}
{isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}
          <h1 className="text-white text-2xl font-bold ml-20 mt-15">Browse By Category</h1>
          <ul class="grid grid-cols-2 md:grid-cols-4 gap-1 pl-20 pr-15 pt-10 mb-10">
          {categories.map((category) => (
             
             
            
            <BrowseCategoryCard key={category.categoryId} category={category}/>
            
          ))
          }
          </ul>


          <h1 className="text-white text-2xl font-bold ml-20">Recommended</h1>
          <ul className="grid grid-cols-1 md:grid-cols-4  sm:grid-cols-3 gap-6 pl-20 pr-15 pt-10 mb-10">
          {item.map((items) => (
            <ItemCard items={items}  />
          ))}
          </ul>


       
          
        </div>
    </div>
    
  )
}

export default BrowseCategory