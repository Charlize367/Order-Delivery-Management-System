import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Item from '../components/AdminItem.jsx'
import Category from '../components/Category.jsx'

const CatalogDashboard = () => {

  
  const token = localStorage.getItem('jwtToken');
  const [categories, setCategories] = useState([]);


  console.log(categories);

    const fetchCategories = async () => {
          try {
            const response = await axios.get('http://localhost:8083/categories', {
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



  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="hero">
          <img src="./main-hero.jpg" className="hero-image" />
          <h1 className="hero-text">Deliciousness at your doorstep.</h1>
          <input type="text" className="search" placeholder="What are you craving for?"/>
        </div>

        <div className="categories-display">
          <ul className="category-list">
          {categories.map((category) => (
            <Category key={category.category_ID} category={category}/>
          ))}
          </ul>
        </div>
                  
      </section>
    </div>
    
  )
}

export default CatalogDashboard