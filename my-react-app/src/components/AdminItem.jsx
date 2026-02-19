import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminItem = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image}, onReload, category_ID } ) => {
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   const API_URL = import.meta.env.VITE_API_URL;
   const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');
   const [showPopup, setShowPopup] = useState(false);
   const [showPopup2, setShowPopup2] = useState(false);
   const [catalogImage, setCatalogImage] = useState(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
     
     const handleDeleteClick = () => {
         setShowDeleteConfirm(!showDeleteConfirm); 
     };



   const openUpdateForm = () => {

      setInputData({
      catalogId : catalogId,
      catalogName: catalogName,
      catalog_description: catalog_description,
      catalog_price: catalog_price,
      catalog_image: catalog_image,
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

  const handleImageChange = (e) => {
  setCategoryImage(e.target.files[0]);
  };
  


  const updateItem = async (e) => {
        e.preventDefault();
        let catalogPayload = { ...inputData };

        try {


          if(catalogImage) {
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

              catalogPayload = {
              ...inputData,
              catalog_image: key, 
            };

              
          }

           const response = await axios.put(`${API_URL}/catalog/${catalogId}/category/${category_ID}`, catalogPayload, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json' 
            }});

          console.log(response);
          e.target.reset();
          openUpdateForm(!isActive);
          setShowPopup(true);

          setTimeout(() => setShowPopup(false), 3000);
          onReload();
        } catch {
          console.log("Failed to Update.");
          
         console.log(inputData);
        }
      }

  const deleteItem = async (e) => {
  setShowDeleteConfirm(false);
        try {
          const response = await axios.delete(`${API_URL}/catalog/${catalogId}`, {
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
    <div  class="group relative block rounded-2xl overflow-hidden">
  

  <img src={`https://${bucket}.s3.${region}.amazonaws.com/${catalog_image}`} alt="" class="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"/>

  <div class="relative bg-[#282928] p-6">
    

    <h3 class="mt-4 text-lg font-medium text-white">{catalogName}</h3>

    <p class="mt-1.5 text-sm text-gray-300">PHP {catalog_price}</p>

    <p class="mt-1.5 text-xs text-gray-300"> {catalog_description}</p>

    <form class="flex mt-4 space-x-10">
      
      <button type="button" onClick={() => openUpdateForm()} class="block w-13 rounded-sm cursor-pointer bg-[#38A45C] hover:bg-[#2C8B47] p-4 text-sm font-medium transition hover:scale-105">
        <img src="/edit-icon.svg" className="w-5"/>
      </button>
       <button onClick={handleDeleteClick} type="button" class="block w-13 rounded-sm bg-[#E53935] hover:bg-[#B71C1C] cursor-pointer p-4 text-sm font-medium transition hover:scale-105">
       <img  src="/delete-icon.svg" className="w-5"/>
      </button>
    </form>
  </div>
</div>
        
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
            <div className="ms-3 text-sm font-normal">Menu details updated successfully.</div>
        </div>
        </div>
        </div>
              )}

              {showPopup2 && (
           <div>
        <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-gray-500 bg-none divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg  top-5 right-5" role="alert">
        <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-white bg-gray-500 rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
            <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
                <span className="sr-only">Check icon</span>
            </div>
            <div className="ms-3 text-sm font-normal">Menu deleted successfully.</div>
        </div>
        </div>
        </div>
              )}
        

          {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Edit Catalog
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                


                    <form onSubmit={updateItem} className="p-4 md:p-5">
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
               hover:file:bg-[#2a2a2a]
 border border-[#2f2f2f] rounded-lg cursor-pointer bg-[#2a2a2a]" type="file" placeholder="Catalog Image" name="catalog_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                     


                        <button type="submit" className="text-white inline-flex items-center cursor-pointer  rounded-sm bg-[#096E22] hover:bg-[#075515] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mt-4 text-center">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div> 
        )}


        {showDeleteConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50">
    <div className="w-full max-w-xs rounded-lg bg-[#1e1e1e] px-6 py-5 text-gray-200 text-center shadow-lg">
      
      <h2 className="text-base font-semibold mb-2">Confirm Delete</h2>
      <p className="text-sm text-gray-400 mb-4">
        Are you sure you want to delete this category?
      </p>

      <div className="space-y-2">
        <button
          onClick={deleteItem}
          className="w-full cursor-pointer rounded-md bg-gradient-to-r from-[#56C789] to-[#096E22] py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Yes, Delete
        </button>

        <button
          onClick={handleDeleteClick}
          className="w-full cursor-pointer rounded-md border border-[#56C789] py-2 text-sm text-[#56C789] hover:bg-[#56C789]/10 transition"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
    </div>
    
  )
}

export default AdminItem