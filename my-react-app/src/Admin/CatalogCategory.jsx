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

      // if (!catalogImage) {
      //   alert("Please select an image"); 
      //   return;
      // }

      setIsLoading(true);
      openAddForm(false);

      try {

    //   const imageData = {
    //     filename: catalogImage.name,
    //     contentType: catalogImage.type,
    //     fileSize: catalogImage.size

    //   }
    //     const { data } = await axios.post(`${API_URL}/images/initiate`, imageData,  {
    //                 headers: {
    //                     'Authorization' : `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //     });


    //     const { uploadUrl, key } = data;

    //   await axios.put(uploadUrl, catalogImage, {
    //     headers: {
    //       'Content-Type': catalogImage.type,
    //     },
    //   });

    //   const catalogPayload = {
    //   ...inputData,
    //   catalog_image: key, 
    // };


     const catalogPayload = {
      ...inputData,
    
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
    <div className="body bg-[#F7F1E8] min-h-screen">
      <Header />
      <section className="dashboard max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="catalog-top flex items-center justify-between flex-wrap gap-4 pt-8">
          <h1 className="text-4xl font-bold text-[#3B2A20] tracking-tight">{param.name}</h1>
         <button onClick={openAddForm} class="flex justify-center  cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 px-6 py-3 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md" href="#">
          Add Item +
        </button>
          

        </div>
        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={showRateLimitPopup} showPopup={showRateLimitPopup} fetchData={fetchCatalogByCategory} currentPage={currentPage} />
        )}
        

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">
                
                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Add Catalog
                        </h3>
                        <button type="button" onClick={openAddForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                


                    <form onSubmit={addItem} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">

                        <div className="col-span-2">
                          <label htmlFor="catalogName"  name="catalogName"  className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" id="catalogName" name="catalogName" placeholder="Catalog Name" value={inputData.catalogName} onChange={handleChange} className="bg-white
 border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>

                        <div className="col-span-2">
                                <label htmlFor="catalog_description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                                <textarea value={inputData.catalog_description} onChange={handleChange} name="catalog_description" id="catalog_description" rows="4" className="bg-white
 border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Description" required></textarea>                    
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="price" className="block mb-2 text-sm font-medium text-[#3B2A20]">Price</label>
                                <input type="number" name="catalog_price" value={inputData.catalog_price} onChange={handleChange}  id="catalog_price" className="bg-white
 border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " placeholder="Price" required/>
                        </div>



                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-[#3B2A20] mb-2" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleImageChange} className="block w-full text-sm text-[#3B2A20]/70
               file:mr-4 file:py-2.5 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-[#A65A34]/10 file:text-[#A65A34]
               hover:file:bg-[#A65A34]/20
               file:transition-colors file:duration-150
              
 border border-[#A65A34]/30 rounded-lg cursor-pointer bg-white p-2.5" type="file" placeholder="Catalog Image" name="catalog_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-2 text-sm text-[#3B2A20]/60" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                      <input type="hidden" name="category" value={inputData.category} onChange={handleChange} />


                        <button type="submit" className="text-[#F7F1E8] inline-flex items-center justify-center w-full sm:w-auto cursor-pointer  rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium text-sm px-6 py-3 mt-2 text-center shadow-sm">
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
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
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
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
            </div>
          )}

                  <ul className="grid grid-cols-1 md:grid-cols-4  sm:grid-cols-3 gap-6 pt-8">
          {item.map((items) => (
            <AdminItem items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>

          {!isLoading && item.length == 0 && (
            <p className="flex justify-center text-[#3B2A20] text-lg py-12">There are no items in this category.</p>
          )}

          {item.length > 0 && (
          <div className="w-full pt-8">
          <Pagination totalPages={totalPages} currentPage={currentPage} fetchData={fetchCatalogByCategory} />
          </div>
          )}
      </section>
    </div>
  )
}

export default CatalogCategory