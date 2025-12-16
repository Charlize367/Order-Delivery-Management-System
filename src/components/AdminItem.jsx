import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminItem = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image}, onReload, category_ID } ) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');
   const [catalogImage, setCatalogImage] = useState();
   const [showPopup, setShowPopup] = useState(false);
   const [showPopup2, setShowPopup2] = useState(false);



   const openUpdateForm = (id) => {

      setInputData({
      catalogId : catalogId,
      catalogName: catalogName,
      catalog_description: catalog_description,
      catalog_price: catalog_price,
      catalog_image: catalog_image
      });
    
    
    setIsActive(!isActive);
  }


  const handleChange = (e) => {

    const { name, value, files, type } = e.target;
  setInputData({
    ...inputData,
    [name]:
      type === "file"
        ? files.length > 0 ? files[0].name : null
        : type === "number"
        ? Number(value)
        : value,
  });
  }
  

  


  const updateItem = async (e) => {
        e.preventDefault();

        try {

          
          const response = await axios.put(`${API_BASE_URL}/catalog/${catalogId}/category/${category_ID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }});

                    setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);

          console.log("Updated");
           e.target.reset();
          openUpdateForm(isActive);
          onReload();
        } catch {
          console.log("Failed to Update.");
          console.log({catalogId})
         console.log(inputData);
        }
      }

  const deleteItem = async (e) => {

        try {
          const response = await axios.delete(`${API_BASE_URL}/catalog/${catalogId}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }});
          console.log("Deleted");
          setShowPopup2(true);

   
          setTimeout(() => setShowPopup2(false), 3000);

          onReload();
        } catch {
          console.log("Failed to delete.");
        }
      }

  return (
    
    <div className="item_card">
    <div  class="group relative block overflow-hidden">
  

  <img src={`${API_BASE_URL}/images/${catalog_image}`} alt="" class="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"/>

  <div class="relative border border-gray-100 bg-white p-6">
    <span class="bg-yellow-400 px-3 py-1.5 text-xs font-medium whitespace-nowrap"> New </span>

    <h3 class="mt-4 text-lg font-medium text-gray-900">{catalogName}</h3>

    <p class="mt-1.5 text-sm text-gray-700">PHP {catalog_price}</p>

    <form class="flex mt-4 space-x-10">
      {/* <button class="block w-full rounded-sm bg-yellow-400 p-4 text-sm font-medium transition hover:scale-105">
        Add to Cart
      </button> */}
      <button onClick={() => openUpdateForm({catalogId})} class="block w-sm rounded-sm bg-yellow-400 p-4 text-sm font-medium transition hover:scale-105">
        <img src="/edit-icon.svg" className="w-5"/>
      </button>
       <button class="block w-sm rounded-sm bg-yellow-400 p-4 text-sm font-medium transition hover:scale-105">
       <img onClick={deleteItem} src="/delete-icon.svg" className="w-5"/>
      </button>
    </form>
  </div>
</div>
        
            {showPopup && (
            <div className="upd-menu-popup">
              Menu details updated successfully.
            </div>
              )}

              {showPopup2 && (
            <div className="del-menu-popup">
              Menu deleted successfully.
            </div>
              )}
        

          {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-gray-100 rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add Category
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                


                    <form onSubmit={updateItem} className="p-4 md:p-5">
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
                     


                        <button type="submit" className="text-white inline-flex items-center bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Add
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}
    </div>
    
  )
}

export default AdminItem