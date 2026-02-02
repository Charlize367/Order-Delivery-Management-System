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
  

  console.log(inputData);

  const openAddForm = () => {
    setIsActive(!isActive);
  };


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }


  const fetchCatalogByCategory = async (page = 0) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/catalog?page=${page}&size=${pageSize}&categoryId=${param.id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          setItem(response.data.content);
          setCurrentPage(response.data.number);
          setTotalPages(response.data.totalPages);
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
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
         <h1 className="text-4xl m-9 font-bold text-white">{param.name}</h1>
        </div>

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={setShowRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCatalogByCategory} currentPage={currentPage} />
        )}

                  <ul className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4 p-10">
          {item.map((items) => (
            <ItemCard items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>

       {item.length == 0 && (
            <p className="flex justify-center text-white text-lg">There are no items in this category.</p>
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