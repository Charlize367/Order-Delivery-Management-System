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
        <img className="catalog_image" src={`${API_BASE_URL}/images/${catalog_image}`}/>
        <p className="catalog_name">{catalogName}</p>
        <p className="catalog_price">PHP {catalog_price}</p>
        <button className="editCatalog" onClick={() => openUpdateForm({catalogId})}><img src="/edit-icon.svg" className="editIcon2"/></button>
        <button className="deleteCatalog" onClick={deleteItem}><img src="/delete-icon.svg" className="deleteIcon2"/></button>
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
        <div className="editItemForm" style={isActive ? {display: "flex"} : {display: "none"}}>
            <h2 className="form-title">Edit Item</h2>
            <button className="closeBtn2" onClick={openUpdateForm}>x</button>
              <form onSubmit={updateItem}>
                <input className="fields" type="text" placeholder="Item Name" name="catalogName" value={inputData.catalogName} onChange={handleChange} required/>
                <textarea className="fields" type="text" placeholder="Item Description" name="catalog_description" value={inputData.catalog_description} onChange={handleChange} required/>
                <input className="fields" type="number" placeholder="Item Price" name="catalog_price" value={inputData.catalog_price} onChange={handleChange} required />
                <input className="fields" type="file" placeholder="Upload new image" name="catalog_image"  onChange={handleChange} /><img className="edit_image" src={`http://localhost:8083/images/${catalog_image}`}/>


               
                <input className="editAddBtn" type="submit" value="Edit"/>
              </form>
          </div>
    </div>
    
  )
}

export default AdminItem