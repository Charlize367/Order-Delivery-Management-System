import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';

const Customers = () => {
   const [isActive, setIsActive] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");


   const openForm = () => {
    setIsActive(!isActive);
  };

  const closeForm = () => {
    setIsActive(isActive);
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

    const handleSubmit = async (event) => {
        event.preventDefault();
            try {
                const postData = {
                  username: username,
                  password: password,
                  role: 'customers'
                }

                const response = await axios.post('http://localhost:8083/users', postData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const customers = response.data;
                console.log(customers);
                return true;

            } catch (error) {
                console.error('Failed to add customer:', error);
                return false;
            }

        }

  return (
    <div className="body">
      <Header />
      <div className="customers">
        <button className="addCustomers" onClick={openForm}>Add Customers/Users</button>
        <div className="form-container2" style={isActive ? {display: "flex"} : {display: "none"}}>
          <button className="closeBtn2" onClick={openForm} href="">x</button>
          <form onSubmit={handleSubmit}>
          <input className="fields" type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
            <input className="fields" type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
            <input className="loginBtn" type="submit" value="Add" />
            </form>
        </div>
      </div>
    </div>
  )
}

export default Customers