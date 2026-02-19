import React from 'react'
import Header from '../components/AdminHeader.jsx'
import AdminItem from '../components/AdminItem.jsx'
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const CatalogCategory = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const param = useParams();
  
  const [item, setItem] = useState([]);
  const token = localStorage.getItem('jwtToken');
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(8);
  const [catalogImage, setCatalogImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  console.log(inputData);
  console.log(item);

  const openAddForm = () => {
    setIsActive(!isActive);
    setInputData({
    catalogName: "",
    catalog_description: "",
    catalog_price: "",
    catalog_image: null,
    category: param.id
  });
  };


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }


  const handleImageChange = (e) => {
  setCatalogImage(e.target.files[0]);
};



  const fetchCatalogByCategory = async (page = 0) => {
          try {
            const response = await axios.get(`${API_URL}/catalog?page=${page}&size=${pageSize}&categoryId=${param.id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          console.log(response);
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


    const addItem = async (event) => {
      event.preventDefault();

      if (!catalogImage) {
        alert("Please select an image"); 
        return;
      }

      setIsLoading(true);
      openAddForm(false);

      try {

      const imageData = {
        filename: catalogImage.name,
        contentType: catalogImage.type,
        fileSize: catalogImage.size

      }
        const { data } = await axios.post(`${API_URL}/images/initiate`, imageData,  {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
        });


        const { uploadUrl, key } = data;

      await axios.put(uploadUrl, catalogImage, {
        headers: {
          'Content-Type': catalogImage.type,
        },
      });

      const catalogPayload = {
      ...inputData,
      catalog_image: key, 
    };

      const response = await axios.post(`${API_URL}/catalog/category/${param.id}`, catalogPayload, {
                  headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
      });

      console.log(response);
      setInputData({
        catalogName: "",
        catalog_description: "",
        catalog_price: "",
        catalog_image: null,
        category: param.id
      });
      event.target.reset();
      openAddForm(isActive);
      fetchCatalogByCategory();
      
      } catch (error) {
        console.log(error);
        if (error.response?.data === "Too many requests" || error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"], 10) || 5;
          setRetryTime(retryAfter);
          setError("Too Many Requests");
          setShowRateLimitPopup(true);
        }
      }

    }

        

        


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
          <h1 className="text-4xl m-9 font-bold text-white">{param.name}</h1>
         <button onClick={openAddForm} class="flex justify-center  cursor-pointer m-10 rounded-sm bg-[#096E22] hover:bg-[#075515] rounded-sm px-12 py-3 text-sm font-medium text-white " href="#">
          Add Item +
        </button>
          

        </div>
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={showRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCatalogByCategory} currentPage={currentPage} />
        )}
        

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Add Catalog
                        </h3>
                        <button type="button" onClick={openAddForm} className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                


                    <form onSubmit={addItem} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">

                        <div className="col-span-2">
                          <label htmlFor="catalogName"  name="catalogName"  className="block mb-2 text-sm font-medium text-white">Name</label>
                          <input type="text" id="catalogName" name="catalogName" placeholder="Catalog Name" value={inputData.catalogName} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required/>
                        </div>

                        <div className="col-span-2">
                                <label htmlFor="catalog_description" className="block mb-2 text-sm font-medium text-white">Description</label>
                                <textarea value={inputData.catalog_description} onChange={handleChange} name="catalog_description" id="catalog_description" rows="4" className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Description" required></textarea>                    
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="price" className="block mb-2 text-sm font-medium text-white">Price</label>
                                <input type="number" name="catalog_price" value={inputData.catalog_price} onChange={handleChange}  id="catalog_price" className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Price" required/>
                        </div>



                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-gray-100 mb-1" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleImageChange} className="block w-full text-sm text-[#9a9a9a]
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-gray-100 file:text-gray-700
              
 border border-[#2f2f2f] rounded-lg cursor-pointer bg-[#2a2a2a]" type="file" placeholder="Catalog Image" name="catalog_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                      <input type="hidden" name="category" value={inputData.category} onChange={handleChange} />


                        <button type="submit" className="text-white inline-flex items-center cursor-pointer  rounded-sm bg-[#096E22] hover:bg-[#075515] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}


              {showPopup && (
            <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Menu added successfully.</div>
        </div>
        </div>
        </div>
              )}

              {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#56C789] border-solid border-green-400"></div>
            </div>
          )}

                  <ul className="grid grid-cols-1 md:grid-cols-4  sm:grid-cols-3 gap-6 p-10">
          {item.map((items) => (
            <AdminItem items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>

          {!isLoading && item.length == 0 && (
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

export default CatalogCategory