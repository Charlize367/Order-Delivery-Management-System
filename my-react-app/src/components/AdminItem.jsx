import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminItem = ({items : {catalogId, catalogName, catalog_price, catalog_description, catalog_image, available}, onReload, category_ID } ) => {
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

   // Availability toggle state
   const [isAvailable, setIsAvailable] = useState(
     available === undefined ? true : Boolean(available)
   );
   const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

   useEffect(() => {
     setIsAvailable(available === undefined ? true : Boolean(available));
   }, [available]);

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
      available: isAvailable,
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
          : type === "checkbox"
          ? e.target.checked
          : value,
    });
  }

  const handleImageChange = (e) => {
    setCatalogImage(e.target.files[0]);
  };

  // Toggle availability directly from the card, without opening the edit form
  // const toggleAvailability = async () => {
  //   const nextValue = !isAvailable;
  //   setIsAvailable(nextValue); // optimistic update
  //   setIsTogglingAvailability(true);

  //   try {
  //     await axios.patch(
  //       `${API_URL}/catalog/${catalogId}/availability`,
  //       { catalog_availability: nextValue },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
  //     onReload();
  //   } catch (err) {
  //     console.log("Failed to update availability.", err);
  //     setIsAvailable(!nextValue); // revert on failure
  //   } finally {
  //     setIsTogglingAvailability(false);
  //   }
  // };

  const toggleAvailability = async () => {
      const nextValue = !isAvailable;
    setIsAvailable(nextValue); // optimistic update
    setIsTogglingAvailability(true);
    try {
      
      const endpoint = isAvailable ? "unavailable" : "available";
      await axios.patch(`${API_URL}/catalog/${catalogId}/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      onReload();
    } catch (err) {
      console.log("Failed to update availability.", err);
      setIsAvailable(!nextValue); // revert on failure
    } finally {
      setIsTogglingAvailability(false);
    }
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
    <div className="group relative block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-[#A65A34]/10">

      <div className="relative">
        <img
          src={`https://${bucket}.s3.${region}.amazonaws.com/${catalog_image}`}
          alt=""
          className={`h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
        />

        {!isAvailable && (
          <span className="absolute top-3 left-3 rounded-full bg-[#3B2A20]/80 text-[#F7F1E8] text-xs font-semibold px-3 py-1 shadow-sm">
            Unavailable
          </span>
        )}

        {/* Availability toggle switch */}
        <button
          type="button"
          onClick={toggleAvailability}
          disabled={isTogglingAvailability}
          title={isAvailable ? "Mark as unavailable" : "Mark as available"}
          className={`absolute top-3 right-3 inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 shadow-sm cursor-pointer disabled:opacity-50 ${
            isAvailable ? 'bg-[#8A9A5B]' : 'bg-[#3B2A20]/40'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              isAvailable ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="relative bg-white p-6">

        <h3 className="mt-2 text-lg font-semibold text-[#3B2A20]">{catalogName}</h3>

        <p className="mt-1.5 text-sm font-medium text-[#A65A34]">PHP {catalog_price}</p>

        <p className="mt-1.5 text-xs text-[#3B2A20]/60 line-clamp-2"> {catalog_description}</p>

        <form className="flex mt-4 gap-3">

          <button type="button" onClick={() => openUpdateForm()} className="flex-1 flex justify-center items-center rounded-lg cursor-pointer bg-[#A65A34] hover:bg-[#8A4A2A] transition-colors duration-150 p-3 text-sm font-medium shadow-sm hover:shadow-md">
            <img src="/edit-icon.svg" className="w-5 invert brightness-0"/>
          </button>
           <button onClick={handleDeleteClick} type="button" className="flex-1 flex justify-center items-center rounded-lg bg-[#3B2A20] hover:bg-[#2A1D15] cursor-pointer transition-colors duration-150 p-3 text-sm font-medium shadow-sm hover:shadow-md">
           <img  src="/delete-icon.svg" className="w-5 invert brightness-0"/>
          </button>
        </form>
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
            <div className="ms-3 text-sm font-normal">Menu details updated successfully.</div>
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
            <div className="ms-3 text-sm font-normal">Menu deleted successfully.</div>
        </div>
        </div>
        </div>
              )}

          {isActive && (
            <div id="crud-modal" tabIndex="-1" className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#3B2A20]/40 backdrop-blur-sm">
            <div className="relative p-4 w-full max-w-md max-h-full">

                <div className="relative bg-[#F7F1E8] rounded-2xl shadow-2xl border border-[#A65A34]/15">

                    <div className="flex items-center justify-between px-6 py-5 rounded-t border-b border-[#A65A34]/15">
                        <h3 className="text-lg font-semibold text-[#3B2A20]">
                            Edit Catalog
                        </h3>
                        <button type="button" onClick={openUpdateForm} className="text-[#3B2A20]/60 cursor-pointer bg-transparent hover:bg-[#A65A34]/10 hover:text-[#3B2A20] transition-colors duration-150 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <form onSubmit={updateItem} className="px-6 py-5">
                        <div className="grid gap-5 mb-5 grid-cols-2">

                        <div className="col-span-2">
                          <label htmlFor="catalogName" className="block mb-2 text-sm font-medium text-[#3B2A20]">Name</label>
                          <input type="text" id="catalogName" name="catalogName" placeholder="Catalog Name" value={inputData.catalogName} onChange={handleChange} className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" required/>
                        </div>

                        <div className="col-span-2">
                                <label htmlFor="catalog_description" className="block mb-2 text-sm font-medium text-[#3B2A20]">Description</label>
                                <textarea value={inputData.catalog_description} onChange={handleChange} name="catalog_description" id="catalog_description" rows="4" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="Description" required></textarea>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="price" className="block mb-2 text-sm font-medium text-[#3B2A20]">Price</label>
                                <input type="number" name="catalog_price" value={inputData.catalog_price} onChange={handleChange}  id="catalog_price" className="bg-white border border-[#A65A34]/30 text-[#3B2A20] text-sm rounded-lg focus:ring-2 focus:ring-[#A65A34] focus:border-[#A65A34] block w-full p-3" placeholder="Price" required/>
                        </div>

                        <div className="col-span-2 sm:col-span-1 flex items-end">
                          <label htmlFor="catalog_availability" className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              id="catalog_availability"
                              name="catalog_availability"
                              checked={Boolean(inputData.catalog_availability)}
                              onChange={handleChange}
                              className="w-4 h-4 rounded border-[#A65A34]/30 text-[#A65A34] focus:ring-[#A65A34]"
                            />
                            <span className="text-sm font-medium text-[#3B2A20]">Available</span>
                          </label>
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
               border border-[#A65A34]/30 rounded-lg" type="file" placeholder="Catalog Image" name="catalog_image" aria-describedby="file_input_help" id="file_input"/>
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
          onClick={deleteItem}
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

export default AdminItem