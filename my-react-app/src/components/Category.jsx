import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Category = ({category : {categoryId, category_name, category_image}, setIsLoading, onReload}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const bucket = import.meta.env.VITE_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const token = localStorage.getItem('jwtToken');
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [categoryImage, setCategoryImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  
  const handleDeleteClick = () => {
      setShowDeleteConfirm(!showDeleteConfirm); 
  };


   const openUpdateForm = (e) => {
      setInputData({
      categoryId : categoryId,
      category_name: category_name,
      category_image: category_image
      });
    
    
    setIsActive(!isActive);
  }


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }

  const handleImageChange = (e) => {
  setCategoryImage(e.target.files[0]);
  };

  
  const updateCategory = async (e) => {
    
        e.preventDefault();
        setIsLoading(true);
        openUpdateForm(isActive);
        let categoryPayload = { ...inputData };

        try {


          if(categoryImage != null) {
            const imageData = {
                filename: categoryImage.name,
                contentType: categoryImage.type,
                fileSize: categoryImage.size

              }
                const { data } = await axios.post(`${API_URL}/images/initiate`, imageData,  {
                            headers: {
                                'Authorization' : `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                });


                const { uploadUrl, key } = data;

              await axios.put(uploadUrl, categoryImage, {
                headers: {
                  'Content-Type': categoryImage.type,
                },
              });

              categoryPayload = {
              ...inputData,
              category_image: key, 
            };

              
          }

           const response = await axios.put(`${API_URL}/categories/${categoryId}`, categoryPayload, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json' 
            }});

          console.log(response);
          e.target.reset();
          
          setShowPopup(true);

          setTimeout(() => setShowPopup(false), 3000);
          onReload();
          setIsLoading(false);
        } catch (error) {
          console.log("Failed to Update.", error);
          console.log(inputData);
          console.log(categoryId);
         
        }
      }

  const deleteCategory = async (e) => {
    setShowDeleteConfirm(false);
    setIsLoading(true);
    
        try {
          const response = await axios.delete(`${API_URL}/categories/${categoryId}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          
          setShowPopup2(true);

          
          setTimeout(() => {
            setShowPopup2(false);
            onReload();
            setIsLoading(false);
          }, 3000);
          
          
          
        } catch {
          console.log("Failed to delete.");
        }
      }

      
  
  return (

    <div className="categories">
    <div className="h-auto max-w-full rounded-base">
        
        <div className="relative">
        <Link to = {`/catalog/${categoryId}/${category_name}`}>
        <article className="relative overflow-hidden rounded-lg shadow-sm transition hover:shadow-lg">
  <img alt="" src={`https://${bucket}.s3.${region}.amazonaws.com/${category_image}`} className="absolute inset-0 h-full w-full object-cover"/>

  <div className="relative bg-linear-to-t from-gray-900/50 to-gray-900/25 pt-32 sm:pt-48 lg:pt-64">
    <div className="p-4 sm:p-6">
      <h1 className="text-white text-2xl font-bold ">{category_name} </h1>
      
    </div>
  </div>
</article>
</Link>
<div className="absolute top-3 right-3 flex space-x-8 z-10">
    <button
      type="button"
      onClick={openUpdateForm}
      className="w-6 h-6 cursor-pointer"
    >
      <img src="./edit-icon.svg" className="pointer-events-none" />
    </button>
    <button
      type="button"
      onClick={handleDeleteClick}
      className="w-6 h-6 cursor-pointer"
    >
      <img src="./delete-icon.svg" className="pointer-events-none" />
    </button>
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
              <div className="ms-3 text-sm font-normal">Category details updated successfully.</div>
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
              <div className="ms-3 text-sm font-normal">Category deleted successfully.</div>
          </div>
          </div>
          </div>
              )}

      
    </div>
  

          {isActive && (
            <div id="crud-modal" tabIndex="-1" className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center  items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
            
                <div className="relative bg-[#242424] rounded-lg shadow-sm ">
                
                    <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-100">
                        <h3 className="text-lg font-semibold text-white">
                            Update Category Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-gray-400 cursor-pointer bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    
                    <form onSubmit={updateCategory} className="p-4 md:p-5">
                        <div className="grid gap-4 mb-4 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="category_name"  name="category_name"  className="block mb-2 text-sm font-medium text-gray-100">Name</label>
                          <input type="text" id="category_name" name="category_name" placeholder="Category Name" value={inputData.category_name} onChange={handleChange} className="bg-[#2a2a2a]
 border border-[#2f2f2f] text-white text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " required/>
                        </div>
                         <div className="col-span-2 ">
                            <label className="block text-sm font-medium text-gray-100 mb-1" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleImageChange} className="block w-full text-sm text-[#9a9a9a]
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-gray-100 file:text-gray-700
               hover:file:bg-gray-200
               bg-[#2a2a2a]
 border border-[#2f2f2f] rounded-lg cursor-pointer " type="file" placeholder="Category Image" name="category_image" aria-describedby="file_input_help" id="file_input"/>
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
          onClick={deleteCategory}
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

export default Category