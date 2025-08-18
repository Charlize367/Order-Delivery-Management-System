import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Category = ({category : {category_ID, category_name, category_image}}) => {

  const [isActive, setIsActive] = useState(false);
   const [inputData, setInputData] = useState([]);
   const token = localStorage.getItem('jwtToken');


   const openUpdateForm = () => {


      setInputData({
      category_ID : category_ID,
      category_name: category_name,
      catalog_image: null
      });
    
    
    setIsActive(!isActive);
  }


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }

  


  const updateCategory = async (e) => {
        e.preventDefault();

        try {

          const response = await axios.put(`http://localhost:8083/category/${category_ID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Updated");
          openUpdateForm(isActive);
          onReload();
        } catch {
          console.log("Failed to Update.");
         
        }
      }

  const deleteCategory = async (e) => {

        try {
          const response = await axios.delete(`http://localhost:8083/category/${category_ID}`, {
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
    <div className="category_card">
        
         {/*<div className="overlay-btns">
        <button className="editCatalog">Edit</button>
        <button className="deleteCatalog" onClick={deleteCategory}>Delete</button>
        </div>*/}
        <img className="category_image" src={`http://localhost:8083/images/${category_image}`}/>
       
        <p className="overlay">{category_name} 

       </p>

        <div className="editItemForm" style={isActive ? {display: "flex"} : {display: "none"}}>
            <h2>Edit Item</h2>
            <button className="closeBtn2" onClick={openUpdateForm}>x</button>
              <form onSubmit={updateCategory}>
                 <input className="fields" type="text" placeholder="Category Name" name="category_name" value={inputData.category_name} onChange={handleChange} />
                <input className="fields" type="file" placeholder="Category Image" name="category_image"  onChange={handleChange} />
                <input className="addBtn" type="submit" value="Edit"/>
              </form>
          </div>
    </div>
  )
}

export default Category