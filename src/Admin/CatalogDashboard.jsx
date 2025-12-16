import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Category from '../components/Category.jsx'
import { useNavigate, Link } from 'react-router-dom';
import SearchResults from '../components/SearchResults.jsx';

const CatalogDashboard = () => {

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);
  const navigate = new useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  



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
  

    const fetchCategories = async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/categories`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
         
            setCategories(response.data);
            
            
          } catch {
            console.error("Error");
          }
        }

        useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post(`${API_BASE_URL}/categories`, inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

              
                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);


                
                const dt = response.data;
                fetchCategories();
                 

                event.target.reset();
                openAddForm(isActive);
                return true;

            } catch (error) {
                console.error('Failed to add item:', error);
                return false;
            }

        }

    const handleReloadData = () => {
      fetchCategories();
    }

    const searchCatalog = (e) => {
      e.preventDefault();
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }




  return (
    <div>
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
          onChange={(e) => setQuery(e.target.value)} class="block w-full p-3 ps-9 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Search" required />
        <button type="button" onClick={searchCatalog} class="absolute end-1.5 bottom-1.5 text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none">Search</button>
    </div>
</form>

    
    </div>
  </div>
</section>

        {showPopup && (
            <div className="add-menu-popup">
              Category added successfully.
            </div>
              )}

        <button onClick={openAddForm} class="flex justify-center  m-10 rounded-sm bg-gradient-to-r from-[#56C789] to-[#096E22] px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600" href="#">
          Add Category +
        </button>

        {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-gray-100 rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add Category
                        </h3>
                        <button type="button" onClick={openAddForm} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={addCategory} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="category_name"  name="category_name"  className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                          <input type="text" id="category_name" name="category_name" placeholder="Category Name" value={inputData.category_name} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required/>
                        </div>
                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleChange} className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-gray-100 file:text-gray-700
               hover:file:bg-gray-200
               border border-gray-300 rounded-lg cursor-pointer bg-gray-50" type="file" placeholder="Category Image" name="category_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                        <button type="submit" className="text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}
       
        
        <div>
          <ul  class="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
             
             
            
            <Category key={category.categoryId} category={category} onReload={handleReloadData}/>
            
          ))
          }
          </ul>
       
          
        </div>
                  
  
    </div>
    
  )
}

export default CatalogDashboard