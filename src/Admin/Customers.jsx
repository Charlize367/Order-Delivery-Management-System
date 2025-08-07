import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Customers = () => {
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [inputData, setInputData] = useState({ username: '', password: '', role: 'Customer' });
   const [updatedUsername, setUpdatedUsername] = useState("");
   const [updatedPassword, setUpdatedPassword] = useState("");
   const [customers, setCustomers] = useState([]);
   const [resource_ID, setResource_ID] = useState(0);
   

   const openForm = () => {
    setIsActive(!isActive);
  };

  const openUpdateForm = () => {
    setIsActive2(!isActive2);
  
  };
  

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  



    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(username);
            try {
              
                const response = await axios.post('http://localhost:8083/users', inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;
                fetchData();
                console.log(dt);
                setResource_ID(response.data.user_ID);
                return true;

            } catch (error) {
                console.error('Failed to add customer:', error);
                return false;
            }

        }

        const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:8083/users', {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setCustomers(response.data);
            console.log(customers);
            console.log(response);
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

          const response = await axios.put(`http://localhost:8083/users/${resource_ID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
          console.log("Updated");
          console.log(resource_ID);
          fetchData();
        } catch {
          console.log("Failed to Update.");
          console.log(inputData);
          console.log(resource_ID);
        }
      }

      const handleChange = (e) => {
  setInputData({ ...inputData, [e.target.name]: e.target.value });
};


  return (
    <div className="body">
      <Header />
      <div className="customers">
        <button className="addCustomers" onClick={openForm}>Add Customers/Users</button>
        <div className="form-container2" style={isActive ? {display: "flex"} : {display: "none"}}>
          <button className="closeBtn2" onClick={openForm}>x</button>
          <form onSubmit={handleSubmit}>
          <input className="fields" type="text" placeholder="Username" name="username" value={inputData.username} onChange={handleChange} />
            <input className="fields" type="password" placeholder="Password" name="password" value={inputData.password} onChange={handleChange} />
            <input className="loginBtn" type="submit" value="Add" />
            </form>
        </div>

        <div className="customers-table">
          <table className="c-table">
            <thead>
            <tr>
              <th>Customer Name</th>
              <th>Account Password</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.username}</td>
                <td>{customer.password}</td>
                <td><center><button className="editBtn"><img className="edit-icon" src="/edit.svg" onClick={openUpdateForm}/></button>
                <button className="deleteBtn"><img className="delete-icon" src="/delete.svg" onClick={() => deleteData(customer.user_ID)} /></button></center>
                </td>
            </tr>
            ))}
            </tbody>
          </table>
          <div className="form-container2" style={isActive2 ? {display: "flex"} : {display: "none"}}>
          <button className="closeBtn2" onClick={openUpdateForm}>x</button>
          <form onSubmit={updateData}>
          <input className="fields" type="text" placeholder="Username" name="username" value={inputData.username} onChange={handleChange} />
            <input className="fields" type="password" placeholder="Password" name="password" value={inputData.password} onChange={handleChange} />
            <input className="loginBtn" type="submit" value="Edit" />
            </form>
            
            
        </div> 
        </div>
      </div>
    </div>
  )
}

export default Customers


