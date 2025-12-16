import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'
import ItemCard from '../components/ItemCard';
import Header from '../components/CustomerHeader';

const BrowseCatalog = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
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
            const response = await axios.get(`${API_BASE_URL}/catalog/category/${param.id}`, {
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

        


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
         <h1 className="text-4xl m-9 font-bold text-white">{param.name}</h1>
        </div>

                  <ul className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4 p-10">
          {item.map((items) => (
            <ItemCard items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>
      </section>
    </div>
  )
}

export default BrowseCatalog