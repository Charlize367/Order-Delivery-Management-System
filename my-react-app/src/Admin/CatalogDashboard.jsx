import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Category from '../components/Category.jsx'
import { useNavigate, Link } from 'react-router-dom';
import SearchResults from '../components/SearchResults.jsx';
import RateLimitPopup from '../components/RateLimitPopup.jsx';

const CatalogDashboard = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [categoryImage, setCategoryImage] = useState(null);
  const [retryTime, setRetryTime] = useState(0);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  

 

  const openAddForm = () => {
    setIsActive(!isActive);
    setInputData({
    category_name: "",
    category_image: null,
   
  });
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }

  const handleImageChange = (e) => {
  setCategoryImage(e.target.files[0]);
};
  

    const fetchCategories = async () => {
          try {
            const response = await axios.get(`${API_URL}/categories/all`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         
            setCategories(response.data);
            setIsLoading(false);
            
          } catch (error) {
            console.error("Error", error);
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


    const addCategory = async (event) => {
      event.preventDefault();

      

      // if (!categoryImage) {
      //   alert("Please select an image"); 
      //   return;
      // }

      setIsLoading(true);
      openAddForm(false);

      try {

    //   const imageData = {
    //     filename: categoryImage.name,
    //     contentType: categoryImage.type,
    //     fileSize: categoryImage.size

    //   }
    //     const { data } = await axios.post(`${API_URL}/images/initiate`, imageData,  {
    //                 headers: {
    //                     'Authorization' : `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //     });


    //     const { uploadUrl, key } = data;

    //   await axios.put(uploadUrl, categoryImage, {
    //     headers: {
    //       'Content-Type': categoryImage.type,
    //     },
    //   });

    //   const categoryPayload = {
    //   ...inputData,
    //   category_image: key, 
    // };

     const categoryPayload = {
      ...inputData,
    
    };

      const response = await axios.post(`${API_URL}/categories`, categoryPayload, {
                  headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
      });

      console.log(response);
      event.target.reset();
      
      
      setShowPopup(true);

      setTimeout(() => setShowPopup(false), 3000);
      
      fetchCategories();
      setIsLoading(false);
      
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



    

    const searchCatalog = (e) => {
      e.preventDefault();
      navigate(`/admin_search?query=${encodeURIComponent(query)}`);
    }




  return (
    <div className="bg-[#F7F1E8] min-h-screen">
      <Header />
     
  <section  className=" bg-cover bg-center bg-no-repeat lg:grid lg:h-[500px] lg:place-content-center" style={{ backgroundImage: `url('/main-hero.svg')` }}>
  <div className="mx-auto w-screen max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
    
    <div className="relative z-10 mx-auto max-w-prose text-center">
      
      <h1 className="relative z-10 text-4xl text-[#F7F1E8] font-bold tracking-tight sm:text-5xl">
        Deliciousness at your doorstep.
      </h1>

      <p className="relative z-10 mt-4 text-base text-pretty text-[#F7F1E8]/90 sm:text-lg/relaxed">
        Explore a menu full of fresh, flavorful dishes crafted to satisfy your cravings, delivered straight to you.
      </p>

      <form  onSubmit={searchCatalog} class="max-w-md mt-8 mx-auto">   
    <label for="search" class="block mb-2.5 text-sm font-medium text-heading sr-only ">Search</label>
    <div class="relative">
        <div class="absolute text-[#3B2A20] inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
            <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
        </div>
        <input type="search" id="search" value={query} 
          onChange={(e) => setQuery(e.target.value)} class="block w-full py-4 px-4 ps-10 bg-[#F7F1E8]  text-[#3B2A20] text-sm rounded-full focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] shadow-md placeholder:text-[#3B2A20]/50" placeholder="Search" required />
        <button type="submit" class="absolute cursor-pointer end-2 top-1/2 -translate-y-1/2 text-[#F7F1E8] bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 rounded-full box-border focus:ring-4 focus:ring-[#A65A34]/30 shadow-sm font-medium leading-5 text-xs px-4 py-2.5 focus:outline-none">Search</button>
    </div>
</form>

    
    </div>
  </div>
</section>

        {showRateLimitPopup && (
          <RateLimitPopup error={error} retryTime={retryTime} setRetryTime={setRetryTime} setShowPopup={showRateLimitPopup} showPopup={showPopup} fetchData={fetchCategories} currentPage={currentPage} />
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
            <div className="ms-3 text-sm font-normal">Category added successfully.</div>
        </div>
        </div>
        </div>
              )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end pt-8">
        <button onClick={openAddForm} class="flex justify-center cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 text-[#F7F1E8] px-6 py-3 text-sm font-medium shadow-sm hover:shadow-md" href="#">
          Add Category +
        </button>
        </div>
        </div>

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15 ">
                
                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Add Category
                        </h3>
                        <button type="button" onClick={openAddForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={addCategory} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="category_name"  name="category_name"  className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" id="category_name" name="category_name" placeholder="Category Name" value={inputData.category_name} onChange={handleChange} className="bg-white
 border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3 " required/>
                        </div>
                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-[#3B2A20] mb-2" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleImageChange} className="block w-full cursor-pointer text-sm text-[#3B2A20]/70
               file:mr-4 file:py-2.5 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-[#A65A34]/10 file:text-[#A65A34]
               hover:file:bg-[#A65A34]/20
               file:transition-colors file:duration-150
               cursor-pointer
               bg-white p-2.5
 border border-[#A65A34]/30 rounded-lg cursor-pointer " type="file" placeholder="Category Image" name="category_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-2 text-sm text-[#3B2A20]/60" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                        <button type="submit" className="text-[#F7F1E8] inline-flex cursor-pointer items-center justify-center w-full sm:w-auto bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium rounded-lg text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}
       
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          {isLoading && (
            <div className="flex items-center justify-center my-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8A9A5B] border-solid border-[#8A9A5B]/30"></div>
            </div>
          )}
          <ul class="grid grid-cols-2 md:grid-cols-3 gap-6">
          
          {!isLoading && categories.length == 0 && (
            <p className="flex justify-center text-[#3B2A20] text-lg col-span-full py-12">There are no categories found.</p>
          )}

          
          {categories.map((category) => (
             
             
            
            <Category key={category.categoryId} category={category} setIsLoading={setIsLoading} onReload={fetchCategories}/>
            
          ))
          }
          </ul>
       
          
        </div>
                  
  
    </div>
    
  )
}

export default CatalogDashboard