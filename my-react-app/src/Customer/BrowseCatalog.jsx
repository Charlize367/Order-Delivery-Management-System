import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'
import ItemCard from '../components/ItemCard';
import Header from '../components/CustomerHeader';
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const BrowseCatalog = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const param = useParams();
  const [item, setItem] = useState([]);
  const token = localStorage.getItem('jwtToken');
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [resource_ID, setResource_ID] = useState(null);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
  

  console.log(inputData);

  const openAddForm = () => {
    setIsActive(!isActive);
  };


 
console.log(item);


  const fetchCatalogByCategory = async (page = 0) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/catalog?page=${page}&size=${pageSize}&categoryId=${param.id}`, {
              headers: {
                        
                        'Content-Type': 'application/json'
                    }});


          setItem(response.data.content);
          setCurrentPage(response.data.number);
          setTotalPages(response.data.totalPages);
          setIsLoading(false);
          } catch (error) {
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
        fetchCatalogByCategory(0);
    }, [param.id]);

    const handleReloadData = () => {
      fetchCatalogByCategory();
    }

        


  return (
    <div className="body min-h-screen bg-[#F7F1E8]">
      <Header />
      <section className="dashboard">
        <div className="catalog-top border-b border-[#E7DCC9] px-10 py-9">
          <h1 className="font-['Fraunces',serif] text-3xl font-semibold text-[#3B2A20] sm:text-4xl">{param.name}</h1>
          <div className="mt-3 h-1 w-14 rounded-full bg-[#A65A34]"></div>
        </div>

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCatalogByCategory} currentPage={currentPage} />
        )}

        {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7DCC9] border-t-[#A65A34]"></div>
            </div>
          )}

        <ul className="grid grid-cols-1 gap-6 p-10 sm:grid-cols-3 md:grid-cols-4">
          {item.map((items) => (
            <ItemCard key={items.catalogId} items={items} onReload={handleReloadData} category_ID={param.id} guestBasket={guestBasket}
  setGuestBasket={setGuestBasket} />
          ))}
        </ul>

        {!isLoading && item.length == 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="mb-4 h-14 w-14 text-[#A65A34]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M5 8h14M6 8v10a2 2 0 002 2h8a2 2 0 002-2V8" />
            </svg>
            <p className="font-['Fraunces',serif] text-lg font-medium text-[#3B2A20]">Nothing here yet</p>
            <p className="mt-1 text-sm text-[#8A7862]">There are no items in this category.</p>
          </div>
        )}

      {item.length > 0 && (
      <div className="w-full">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchCatalogByCategory} />
      </div>  
      )}
      
      </section>

    </div>
  )
}

export default BrowseCatalog