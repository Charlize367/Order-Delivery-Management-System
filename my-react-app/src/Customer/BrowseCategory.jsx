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

  const [guestBasket, setGuestBasket] = useState(() => {
        try {
    const basketString = localStorage.getItem('basket');
    if (!basketString || basketString === "undefined") {
      return [];
    }
    return JSON.parse(basketString);
  } catch (err) {
    console.warn("Invalid basket in localStorage, resetting to empty array", err);
    return [];
  }
    })

     useEffect(() => {
        localStorage.setItem('basket', JSON.stringify(guestBasket));
      }, [guestBasket])
  

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
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />
      <section
        className="relative bg-cover bg-center bg-no-repeat lg:grid lg:h-[520px] lg:place-content-center"
        style={{ backgroundImage: `url('/main-hero.svg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B2A20]/70 via-[#3B2A20]/55 to-[#3B2A20]/70"></div>
        <div className="relative z-10 mx-auto w-screen max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-30">

          <div className="relative z-10 mx-auto max-w-prose text-center">

            <span className="mb-4 inline-block rounded-full bg-[#A65A34]/90 px-4 py-1 text-xs font-medium uppercase tracking-wider text-white">
              Fresh &amp; made to order
            </span>

            <h1 className="relative z-10 font-['Fraunces',serif] text-4xl font-semibold text-white sm:text-5xl">
              Deliciousness at your doorstep.
            </h1>

            <p className="relative z-10 mt-4 text-base text-pretty text-[#F7F1E8]/90 sm:text-lg/relaxed">
              Explore a menu full of fresh, flavorful dishes crafted to satisfy your cravings, delivered straight to you.
            </p>

            <form onSubmit={searchCatalog} className="mx-auto mt-6 max-w-md sm:mt-8">
              <label htmlFor="search" className="sr-only mb-2.5 block text-sm font-medium">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-[#A65A34]">
                  <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                </div>
                <input type="search" id="search" value={query}
                  onChange={(e) => setQuery(e.target.value)} className="block w-full rounded-full border-0 bg-white p-5 ps-11 text-sm text-[#3B2A20] shadow-lg placeholder:text-[#8A7862] focus:outline-none focus:ring-2 focus:ring-[#A65A34]" placeholder="Search for a dish" required />
                <button type="submit" className="absolute end-2 bottom-2 top-2 cursor-pointer rounded-full bg-[#A65A34] px-5 text-xs font-medium text-white transition hover:bg-[#8B4A2A] focus:outline-none focus:ring-4 focus:ring-[#A65A34]/40">Search</button>
              </div>
            </form>

          </div>
        </div>
      </section>
      <div>

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCategories} currentPage={currentPage} />
        )}

        {/* Featured Combos — static promo banner, links out to the full combos page */}
        <div className="mx-20 mt-16">
          <Link
            to="/browse_combos"
            className="group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-[#3B2A20] px-8 py-10 text-left transition-transform duration-150 hover:-translate-y-0.5 sm:flex-row sm:items-center"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#A65A34]/30 blur-2xl"></div>
            <div className="pointer-events-none absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-[#8A9A5B]/25 blur-2xl"></div>

            <div className="relative">
              <span className="inline-block rounded-full bg-[#A65A34]/90 px-4 py-1 text-xs font-medium uppercase tracking-wider text-white">
                Bundle &amp; save
              </span>
              <h2 className="mt-3 font-['Fraunces',serif] text-2xl font-semibold text-white sm:text-3xl">
                Good things come in pairs.
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#F7F1E8]/80 sm:text-base">
                We've paired up some of our favorite dishes into combos worth ordering twice — take a look before you decide what to have.
              </p>
            </div>

            <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F7F1E8] px-6 py-3 text-sm font-medium text-[#3B2A20] transition-colors duration-150 group-hover:bg-white">
              Browse Combos
              <svg className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>


        {!isLoading && categories.length == 0 && (
          <p className="flex justify-center py-10 text-lg text-[#8A7862]">There are no categories found.</p>
        )}
        {isLoading && (
          <div className="flex items-center justify-center my-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
          </div>
        )}


        <div className="ml-20 mt-16 flex items-center gap-3">
          <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-[#3B2A20]">Browse By Category</h1>
          <div className="h-1 flex-1 max-w-20 rounded-full bg-[#8A9A5B]/40"></div>
        </div>
        <ul className="grid grid-cols-2 gap-3 pl-20 pr-15 pt-8 mb-10 md:grid-cols-4">
          {categories.map((category) => (

            <BrowseCategoryCard key={category.categoryId} category={category} />

          ))
          }
        </ul>


        <div className="ml-20 mt-4 flex items-center gap-3">
          <h1 className="font-['Fraunces',serif] text-2xl font-semibold text-[#3B2A20]">Recommended</h1>
          <div className="h-1 flex-1 max-w-20 rounded-full bg-[#A65A34]/30"></div>
        </div>
        <ul className="grid grid-cols-1 gap-6 pl-20 pr-15 pt-8 mb-10 sm:grid-cols-3 md:grid-cols-4">
          {item.map((items) => (
            <ItemCard key={items.catalogId} items={items} guestBasket={guestBasket} setGuestBasket={setGuestBasket} />
          ))}
        </ul>



      </div>
    </div>

  )
}

export default BrowseCategory