import React from 'react'
import Header from '../components/AdminHeader.jsx'
import AdminItem from '../components/AdminItem.jsx'
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'

const CatalogCategory = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const param = useParams();
  const [item, setItem] = useState([]);
  const token = localStorage.getItem('jwtToken');
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [resource_ID, setResource_ID] = useState(null);
  const [showPopup, setShowPopup] = useState(false);


  console.log(inputData);

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


  const fetchCatalogByCategory = async () => {
          try {
            const response = await axios.get(`${API_BASE_URL}/catalog/category/${param.id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});


          setItem(response.data);
          } catch {
            console.error("Error");
          
          }
        }

    useEffect(() => {
        fetchCatalogByCategory();
    }, [param.id]);

    const handleReloadData = () => {
      fetchCatalogByCategory();
    }


    const addItem = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post(`${API_BASE_URL}/catalog/category/${param.id}`, inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                handleReloadData();
                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);

              
                const dt = response.data;
                
                event.target.reset();
                openAddForm(isActive);
                
                return true;

            } catch (error) {
                console.error('Failed to add item:', error);
                return false;
            }

        }

        


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
          <h1 className="text-4xl m-9 font-bold text-white">{param.name}</h1>
         <button onClick={openAddForm} class="flex justify-center  m-10 rounded-sm bg-gradient-to-r from-[#56C789] to-[#096E22] px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600" href="#">
          Add Item +
        </button>
          

        </div>

        

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
                    
                


                    <form onSubmit={addItem} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">

                        <div className="col-span-2">
                          <label htmlFor="catalogName"  name="catalogName"  className="block mb-2 text-sm font-medium text-gray-900">Name</label>
                          <input type="text" id="catalogName" name="catalogName" placeholder="Catalog Name" value={inputData.catalogName} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required/>
                        </div>

                        <div className="col-span-2">
                                <label htmlFor="catalog_description" className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                                <textarea value={inputData.catalog_description} onChange={handleChange} name="catalog_description" id="catalog_description" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 " placeholder="Description" required></textarea>                    
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">Price</label>
                                <input type="number" name="catalog_price" value={inputData.catalog_price} onChange={handleChange}  id="catalog_price" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " placeholder="Price" required/>
                        </div>



                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleChange} className="block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-gray-100 file:text-gray-700
               hover:file:bg-gray-200
               border border-gray-300 rounded-lg cursor-pointer bg-gray-50" type="file" placeholder="Catalog Image" name="catalog_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                      <input type="hidden" name="category" value={inputData.category} onChange={handleChange} />


                        <button type="submit" className="text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}


              {showPopup && (
            <div className="add-menu-popup">
              Menu added successfully.
            </div>
              )}

                  <ul className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4 p-10">
          {item.map((items) => (
            <AdminItem items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>
      </section>
    </div>
  )
}

export default CatalogCategory