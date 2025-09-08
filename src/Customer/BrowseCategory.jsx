import React from 'react'
import Header from '../components/CustomerHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import BrowseCategoryCard from '../components/BrowseCategoryCard.jsx'
import { useNavigate, Link } from 'react-router-dom';

const BrowseCategory = () => {

  
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);
  const navigate = new useNavigate();
  const [query, setQuery] = useState("");
  

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
            console.log(token);
          }
        }

        useEffect(() => {
        fetchCategories();
    }, []);

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
        
        <div className="categories-display" >
          <ul className="category-list">
          {categories.map((category) => (
             
             
            
            <BrowseCategoryCard key={category.category_ID} category={category}/>
            
          ))
          }
          </ul>
       
          
        </div>
                  
      </section>
    </div>
    
  )
}

export default BrowseCategory