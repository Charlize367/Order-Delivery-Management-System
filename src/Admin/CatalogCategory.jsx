import React from 'react'
import AdminItem from '../components/AdminItem.jsx'

const CatalogCategory = () => {

  const fetchData = async () => {
    const [item, setItem] = useState([]);


    console.log(item);
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

  return (
    <div className="body">
      <Header />
      <section className="dashboard">
                  <ul className="item-display">
          {item.map((items) => (
            <AdminItem items={items}/>
          ))}
          </ul>
      </section>
    </div>
  )
}

export default CatalogCategory