import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const AdminItem = ({items : {catalog_ID, catalog_name, catalog_price, catalog_description, catalog_image}, onReload } ) => {

   const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');


   const openUpdateForm = (id) => {


      setInputData({
      catalog_ID : catalog_ID,
      catalog_name: catalog_name,
      catalog_description: catalog_description,
      catalog_price: catalog_price,
      catalog_image: null
      });
    
    
    setIsActive(!isActive);
  }


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }

  


  const updateItem = async (e) => {
        e.preventDefault();

        try {

          const response = await axios.put(`http://localhost:8083/catalog/${catalog_ID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Updated");
          openUpdateForm(isActive);
          onReload();
        } catch {
          console.log("Failed to Update.");
          console.log({catalog_ID})
         
        }
      }

  const deleteItem = async (e) => {

        try {
          const response = await axios.delete(`http://localhost:8083/catalog/${catalog_ID}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Deleted");
          onReload();
        } catch {
          console.log("Failed to delete.");
        }
      }

  return (
    <div className="item_card">
        <img className="catalog_image" src={`http://localhost:8083/images/${catalog_image}`}/>
        <p className="catalog_name">{catalog_name}</p>
        <p className="catalog_price">PHP {catalog_price}</p>
        <button className="editCatalog" onClick={() => openUpdateForm({catalog_ID})}>Edit</button>
        <button className="deleteCatalog" onClick={deleteItem}>Delete</button>

        <div className="editItemForm" style={isActive ? {display: "flex"} : {display: "none"}}>
            <h2>Edit Item</h2>
            <button className="closeBtn2" onClick={openUpdateForm}>x</button>
              <form onSubmit={updateItem}>
                <input className="fields" type="text" placeholder="Item Name" name="catalog_name" value={inputData.catalog_name} onChange={handleChange} />
                <textarea className="fields" type="text" placeholder="Item Description" name="catalog_description" value={inputData.catalog_description} onChange={handleChange} />
                <input className="fields" type="number" placeholder="Item Price" name="catalog_price" value={inputData.catalog_price} onChange={handleChange} />
                <input className="fields" type="file" placeholder="Item Image" name="catalog_image" onChange={handleChange} />

                <input className="addBtn" type="submit" value="Edit"/>
              </form>
          </div>
    </div>
    
  )
}

export default AdminItem