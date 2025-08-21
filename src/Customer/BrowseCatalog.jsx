import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react'
import ItemCard from '../components/ItemCard';
import Header from '../components/CustomerHeader';

const BrowseCatalog = () => {

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

        


  return (
    <div className="body">
      <Header />
      <section className="dashboard">
        <div className="catalog-top">
          <h1 className="cat-label">{param.name}</h1>
        </div>

                  <ul className="itemDisplay">
          {item.map((items) => (
            <ItemCard items={items} onReload={handleReloadData} category_ID={param.id} />
          ))}
          </ul>
      </section>
    </div>
  )
}

export default BrowseCatalog