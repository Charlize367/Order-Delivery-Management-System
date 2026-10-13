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
        <article className="group relative overflow-hidden h-64 sm:h-72 rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl">
  <img alt="" src={`https://${bucket}.s3.${region}.amazonaws.com/${category_image}`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>

  <div className="
  absolute inset-0
  bg-gradient-to-t
  from-[#3B2A20]/85
  via-[#3B2A20]/20
  to-transparent
  transition-all duration-300
  group-hover:from-[#3B2A20]/95
">
    <div className="absolute bottom-0 p-4 sm:p-6">
      <h1 className="text-[#F7F1E8] text-2xl font-bold">{category_name} </h1>

    </div>
  </div>
</article>
</Link>
<div className="absolute top-3 right-3 flex space-x-2 z-10">
    <button
      type="button"
      onClick={openUpdateForm}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] cursor-pointer transition-colors duration-150 shadow-sm"
    >
      <img src="./edit-icon.svg" className="w-4 h-4 pointer-events-none" />
    </button>
    <button
      type="button"
      onClick={handleDeleteClick}
      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3B2A20] hover:bg-[#2A1D15] cursor-pointer transition-colors duration-150 shadow-sm"
    >
      <img src="./delete-icon.svg" className="w-4 h-4 pointer-events-none" />
    </button>
  </div>
</div>



        {showPopup && (
            <div>
          <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none top-5 right-5 z-50" role="alert">
          <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
              <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
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
          <div id="toast-top-right" className="fixed flex items-center w-full max-w-xs p-4 space-x-4 text-[#3B2A20] bg-none top-5 right-5 z-50" role="alert">
          <div id="toast-success" className="flex items-center w-full max-w-xs p-4 text-[#F7F1E8] bg-[#3B2A20] rounded-xl shadow-lg" role="alert">
              <div className="inline-flex items-center justify-center shrink-0 w-9 h-9 text-[#8A9A5B] bg-[#8A9A5B]/15 rounded-lg">
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
            <div id="crud-modal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Update Category Details
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={updateCategory} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">
                        <div className="col-span-2">
                          <label htmlFor="category_name" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" id="category_name" name="category_name" placeholder="Category Name" value={inputData.category_name} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" required/>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-sm font-medium text-[#3B2A20] mb-2" htmlFor="file_input">Upload an image</label>
                            <input onChange={handleImageChange} className="block w-full cursor-pointer text-sm text-[#3B2A20]/70
               file:mr-4 file:py-2.5 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-[#A65A34]/10 file:text-[#A65A34]
               hover:file:bg-[#A65A34]/20
               file:transition-colors file:duration-150
               bg-white p-2.5
               border border-[#A65A34]/30 rounded-lg" type="file" placeholder="Category Image" name="category_image" aria-describedby="file_input_help" id="file_input"/>
                            <p className="mt-2 text-sm text-[#3B2A20]/60" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                      </div>
                        <button type="submit" className="text-[#F7F1E8] inline-flex items-center cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 focus:ring-4 focus:outline-none focus:ring-[#A65A34]/30 font-medium text-sm px-6 py-3 mt-2 text-center shadow-sm">
                            <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )}

        {showDeleteConfirm && (
  <div className="fixed inset-0 z-99 flex items-center justify-center bg-[#3B2A20]/50 backdrop-blur-sm">
    <div className="w-full max-w-xs rounded-2xl bg-[#F7F1E8] px-6 py-5 text-[#3B2A20] text-center shadow-2xl border border-[#A65A34]/15">

      <h2 className="text-base font-semibold mb-2">Confirm Delete</h2>
      <p className="text-sm text-[#3B2A20]/60 mb-4">
        Are you sure you want to delete this category?
      </p>

      <div className="space-y-2">
        <button
          onClick={deleteCategory}
          className="w-full cursor-pointer rounded-lg bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 py-2.5 text-sm font-medium text-[#F7F1E8] shadow-sm hover:shadow-md"
        >
          Yes, Delete
        </button>

        <button
          onClick={handleDeleteClick}
          className="w-full cursor-pointer rounded-lg border border-[#A65A34]/30 py-2.5 text-sm text-[#3B2A20] hover:bg-[#A65A34]/10 transition-colors duration-150"
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