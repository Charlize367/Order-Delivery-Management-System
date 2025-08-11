import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';
import Item from '../components/Item.jsx'

const CatalogDashboard = () => {
  const token = localStorage.getItem('jwtToken');
  const [item, setItem] = useState([]);

  
  const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:8083/catalog', {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setItem(response.data);
            
          } catch {
            console.error("Error");
          }
        }

        useEffect(() => {
        fetchData();
    }, []);

console.log(item);
  return (
    <div className="body">
      <Header />
      <section className="dashboard">
                  <ul className="item-display">
          {item.map((items) => (
            <Item items={items}/>
          ))}
          </ul>
      </section>
    </div>
    
  )
}

export default CatalogDashboard