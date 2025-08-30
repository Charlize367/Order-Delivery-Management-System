import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'
import ItemCard from '../components/ItemCard';
import Header from '../components/CustomerHeader';

import React from 'react'

const SearchResults = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    const [results, setResults] = useState([]);
    const token = localStorage.getItem('jwtToken');

    const getSearchResults = async () => {
          try {
            const response = await axios.get(`http://localhost:8083/catalog/search?query=${query}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});

            setResults(response.data);
                } catch{
                    console.log("Error");
                }
            }

            useEffect(() => {
        getSearchResults();
    }, [query]);


    const found = results.some(item =>
  item.catalogName.toLowerCase().includes(query.toLowerCase().trim())
);


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
      <h1 className="search-results-txt"> Search results for "{query}"</h1>
      <div className="searchResults" style={{display:'flex'}}>
      {!found && query.trim() !== "" && <h2 className="no-results-txt">No results found.</h2>}
      {results.map((items) => {
            
        


            return(
      
      <ul className="itemDisplay" >
          
            
    <ItemCard  items={items}/>
            
         
          
          
          </ul>
         
           )
          })}
           </div>
      </section>
    </div>
  )

}

export default SearchResults