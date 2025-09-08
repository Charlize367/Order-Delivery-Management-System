import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Category from '../components/Category.jsx'
import { useNavigate, Link } from 'react-router-dom';
import SearchResults from '../components/SearchResults.jsx';

const CatalogDashboard = () => {

  
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
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="hero">
          <img src="./main-hero.jpg" className="hero-image" />
          <h1 className="hero-text">Deliciousness at your doorstep.</h1>
          <input type="text" name="search" className="search" placeholder="What are you craving for?" value={query} 
          onChange={(e) => setQuery(e.target.value)}/>
          <button className="search-btn" onClick={searchCatalog} ><img src="./search.svg" className="search-icon"/></button>
        </div>

        {showPopup && (
            <div className="add-menu-popup">
              Category added successfully.
            </div>
              )}
        <button className="addCategoryBtn" onClick={openAddForm}>Add Category</button>
        <div className="addCatForm" style={isActive ? {display: "flex"} : {display: "none"}}>
            <h2>Add Category</h2>
            <button className="closeBtn2" onClick={openAddForm}>x</button>
              <form onSubmit={addCategory}>
                <input className="fields" type="text" placeholder="Category Name" name="category_name" value={inputData.category_name} onChange={handleChange} />
                <input className="fields" type="file" placeholder="Category Image" name="category_image"  onChange={handleChange} />
                <input className="addBtn" type="submit" value="Add"/>
              </form>
          </div>
        <div className="categories-display" >
          <ul className="category-list">
          {categories.map((category) => (
             
             
            
            <Category key={category.category_ID} category={category} onReload={handleReloadData}/>
            
          ))
          }
          </ul>
       
          
        </div>
                  
      </section>
    </div>
    
  )
}

export default CatalogDashboard