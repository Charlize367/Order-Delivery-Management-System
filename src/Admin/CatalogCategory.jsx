import React from 'react'
import Header from '../components/AdminHeader.jsx'
import AdminItem from '../components/AdminItem.jsx'
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'

const CatalogCategory = () => {

  const param = useParams();
  const [item, setItem] = useState([]);
  const token = localStorage.getItem('jwtToken');
  const [isActive, setIsActive] = useState(false);
  const [inputData, setInputData] = useState([]);
  const [resource_ID, setResource_ID] = useState(null);


  console.log(inputData);

  const openAddForm = () => {
    setIsActive(!isActive);
  };


  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
  setInputData({ ...inputData, [name]: type === "file" ? files[0] : type === "number" ? Number(value) : value,
    });
  }


  const fetchCatalogByCategory = async () => {
          try {
            const response = await axios.get(`http://localhost:8083/catalog/category/${param.id}`, {
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
        fetchCatalogByCategory();
    }, [param.id]);

    const handleReloadData = () => {
      fetchCatalogByCategory();
    }


    const addItem = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post(`http://localhost:8083/catalog/category/${param.id}`, inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

              
                const dt = response.data;
                fetchCatalogByCategory();
                openAddForm(isActive);
                return true;

            } catch (error) {
                console.error('Failed to add item:', error);
                return false;
            }

        }

        


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
          <h1 className="cat-label">{param.name}</h1>
          <button className="addCatalog" onClick={openAddForm}>Add Item</button>
          <div className="addItemForm" style={isActive ? {display: "flex"} : {display: "none"}}>
            <h2>Add Item</h2>
            <button className="closeBtn2" onClick={openAddForm}>x</button>
              <form onSubmit={addItem}>
                <input className="fields" type="text" placeholder="Item Name" name="catalog_name" value={inputData.catalog_name} onChange={handleChange} />
                <textarea className="fields" type="text" placeholder="Item Description" name="catalog_description" value={inputData.catalog_description} onChange={handleChange} />
                <input className="fields" type="number" placeholder="Item Price" name="catalog_price" value={inputData.catalog_price} onChange={handleChange} />
                <input className="fields" type="file" placeholder="Item Image" name="catalog_image"  onChange={handleChange} />
                <input type="hidden" name="category" value={inputData.category} onChange={handleChange} />
                <input className="addBtn" type="submit" value="Add"/>
              </form>
          </div>
        </div>

                  <ul className="item-display">
          {item.map((items) => (
            <AdminItem items={items} onReload={handleReloadData} />
          ))}
          </ul>
      </section>
    </div>
  )
}

export default CatalogCategory