import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';


const Customers = () => {
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [inputData, setInputData] = useState({
    user_ID : null,
    username: "",
    password: "",
    role: "CUSTOMER"
   })
   const [customers, setCustomers] = useState([]);
   const [resource_ID, setResource_ID] = useState(null);

   

   const openForm = () => {
    setIsActive(!isActive);
  };

  const openUpdateForm = (id) => {
    
    const selectedCustomer = customers.find(customer => customer.user_ID === id)
    setResource_ID(id);
    if (selectedCustomer) {
      setInputData({
      user_ID : selectedCustomer.user_ID,
      username: selectedCustomer.username,
      password: selectedCustomer.password,
      role: "CUSTOMER"
      });
    }
    
    setIsActive2(!isActive2);
}



const updateID = customers.find(c => c.user_ID === resource_ID)?.user_ID;
  




  const handleChange = (e) => {
    const { name, value} = e.target;
  setInputData({ ...inputData, [name]: value });
  }


  


    const handleSubmit = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post('http://localhost:8083/users', inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;
                fetchData();
               
                console.log(inputData);
                return true;

            } catch (error) {
                console.error('Failed to add customer:', error);
                return false;
                console.log(inputData);
            }

        }

        const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:8083/users/role/CUSTOMER', {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setCustomers(response.data);
            openForm(isActive);
          } catch {
            console.error("Error");
          }
        }

        useEffect(() => {
        fetchData();
    }, []);


      const deleteData = async (id) => {

        try {
          const response = await axios.delete(`http://localhost:8083/users/${id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Deleted");
        
          fetchData();
        } catch {
          console.log("Failed to delete.");
        }
      }


      const updateData = async (e) => {
        e.preventDefault();

      
      
        try {

          const response = await axios.put(`http://localhost:8083/users/${updateID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Updated");
          fetchData();
          openUpdateForm(isActive2);
        } catch {
          console.log("Failed to Update.");
          console.log(inputData);
         
        }
      }
      

    

  return (
    <div className="body">
      <Header />
      <div className="users">
        <button className="addUsers" onClick={openForm}>Add Customers/Users</button>
        <div className="add-form" style={isActive ? {display: "none"} : {display: "flex"}}>
          <h2>Add Customers</h2>
          <button className="closeBtn2" onClick={openForm}>x</button>
          <form onSubmit={handleSubmit}>
          <input className="fields" type="text" placeholder="Username" name="username" value={inputData.username} onChange={handleChange} />
            <input className="fields" type="password" placeholder="Password" name="password" value={inputData.password} onChange={handleChange} />
             <input type="hidden" name="role" value="CUSTOMER" onChange={handleChange} />
            <input className="loginBtn" type="submit" value="Add"/>
            </form>
        </div>
        
        <div className="customers-table">
          <table className="u-table">
            <thead>
            <tr>
              <th>Customer Name</th>
              <th>Account Password</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {customers.map(customer => (
              <tr key={customer.user_ID}>
                <td>{customer.username}</td>
                <td>{customer.password}</td>
                <td><center><button className="editBtn"><img className="edit-icon" src="/edit-icon.svg" onClick={() => openUpdateForm(customer.user_ID)}/></button>
                <button className="deleteBtn"><img className="delete-icon" src="/delete-icon.svg" onClick={() => deleteData(customer.user_ID)} /></button></center>
                </td>
            </tr>
            ))}
            </tbody>
            
          </table>
          <div className="edit-form" style={isActive2 ? {display: "flex"} : {display: "none"}}>
             <h2>Edit Customers</h2>
          <button className="closeBtn2" onClick={openUpdateForm}>x</button>
          <form onSubmit={updateData}>
          <input className="fields" type="text" placeholder="Username" name="username" value={inputData.username} onChange={handleChange} required/>
            <input className="fields" type="password" placeholder="Password" name="password" value={inputData.password} onChange={handleChange} required />
            <input className="loginBtn" type="submit" value="Edit" />
            </form>
            
        
        </div> 
        </div>
      </div>
    </div>
  )
}


export default Customers;


