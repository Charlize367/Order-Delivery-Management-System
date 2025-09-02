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
   const [showPopup, setShowPopup] = useState(false);
   const [showPopup2, setShowPopup2] = useState(false);
   const [showPopup3, setShowPopup3] = useState(false);

   

   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    username: "",
    password: "",
    role: "CUSTOMER"
  });
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
               

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
                console.log(inputData);
                 event.target.reset();
                 
                 openForm(isActive);
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
            
          } catch {
            console.error("Error");
          }
        }

        useEffect(() => {
        fetchData();
    }, []);


      const deleteData = async (id) => {

        try {
          const response = await axios.delete(`http://localhost:8083/users/customers/${id}`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
                    setShowPopup2(true);

   
                setTimeout(() => setShowPopup2(false), 3000);
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

                    setShowPopup3(true);

   
                setTimeout(() => setShowPopup3(false), 3000);
          console.log("Updated");
          fetchData();
           e.target.reset();
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
        <div className="add-form" style={isActive ? {display: "flex"} : {display: "none"}}>
          <h2>Add Customers</h2>
          <button className="closeBtn2" onClick={openForm}>x</button>
          <form onSubmit={handleSubmit}>
          <input className="fields" type="text" placeholder="Username" name="username" value={inputData.username} onChange={handleChange} />
            <input className="fields" type="password" placeholder="Password" name="password" value={inputData.password} onChange={handleChange} />
             <input type="hidden" name="role" value="CUSTOMER" onChange={handleChange} />
            <input className="loginBtn" type="submit" value="Add"/>
            </form>
        </div>
        {showPopup && (
            <div className="add-user-popup">
              Customer added successfully.
            </div>
              )}

              {showPopup2 && (
            <div className="del-user-popup">
              Customer deleted successfully.
            </div>
              )}

              {showPopup3 && (
            <div className="upd-user-popup">
              Customer details updated successfully.
            </div>
              )}

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
                <td className="action-td"><center><button className="editBtn"><img className="edit-icon" src="/edit-icon.svg" onClick={() => openUpdateForm(customer.user_ID)}/></button>
                <button className="deleteBtn"><img className="delete-icon" src="/delete-icon.svg" onClick={() => deleteData(customer.userId)} /></button></center>
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


