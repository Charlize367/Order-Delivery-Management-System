import React from 'react'
import Header from '../components/AdminHeader.jsx'
import { useState, useEffect } from 'react'
import axios from 'axios';


const DeliveryDrivers = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
   const [isActive, setIsActive] = useState(false);
   const [isActive2, setIsActive2] = useState(false);
   const token = localStorage.getItem('jwtToken')
   const [inputData, setInputData] = useState({
    userId : null,
    username: "",
    password: "",
    role: "DELIVERY"
   })
   const [deliveryDrivers, setDeliveryDrivers] = useState([]);
   const [resource_ID, setResource_ID] = useState(null);
   const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showPopup3, setShowPopup3] = useState(false);

   
   const openForm = () => {
    setIsActive(!isActive);
    setInputData({
    username: "",
    password: "",
    role: "DELIVERY"
  });
  };

  const openUpdateForm = (id) => {
    
    const selectedDeliveryDriver = deliveryDrivers.find(deliveryDriver => deliveryDriver.userId === id)
    setResource_ID(id);
    if (selectedDeliveryDriver) {
      setInputData({
      userId : selectedDeliveryDriver.userId,
      username: selectedDeliveryDriver.username,
      password: selectedDeliveryDriver.password,
      role: "DELIVERY"
      });
    }
    
    setIsActive2(!isActive2);
}



const updateID = deliveryDrivers.find(d => d.userId === resource_ID)?.userId;
  




  const handleChange = (e) => {
    const { name, value} = e.target;
  setInputData({ ...inputData, [name]: value });
  }



    const handleSubmit = async (event) => {
        event.preventDefault();
        
            try {
              
                const response = await axios.post(`${API_BASE_URL}/users`, inputData, {
                    headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dt = response.config.data;
                fetchData();
                 event.target.reset();
                openForm(isActive);

                setShowPopup(true);

   
                setTimeout(() => setShowPopup(false), 3000);
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
            const response = await axios.get(`${API_BASE_URL}/users/role/DELIVERY`, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
            setDeliveryDrivers(response.data);
          } catch {
            console.error("Error");
          }
        }

        useEffect(() => {
        fetchData();
    }, []);


      const deleteData = async (e, id) => {
        e.preventDefault();
        try {
          const response = await axios.delete(`${API_BASE_URL}/users/delivery/${id}`, {
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

          const response = await axios.put(`${API_BASE_URL}/users/${updateID}`, inputData, {
              headers: {
                        'Authorization' : `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }});
                    setShowPopup3(true);

   
                setTimeout(() => setShowPopup3(false), 3000);
          console.log("Updated");
          fetchData();
           event.target.reset();
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
        <button className="addUsers" onClick={openForm}>Add Delivery Drivers</button>
        <div className="add-form" style={isActive ? {display: "flex"} : {display: "none"}}>
          <h2>Add Delivery Driver</h2>
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
              Driver added successfully.
            </div>
              )}

              {showPopup2 && (
            <div className="del-user-popup">
              Driver deleted successfully.
            </div>
              )}

              {showPopup3 && (
            <div className="upd-user-popup">
              Driver details updated successfully.
            </div>
              )}

        <div className="delivery-table">
          <table className="u-table">
            <thead>
            <tr>
              <th>Driver Name</th>
              <th>Account Password</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {deliveryDrivers.map(driver => (
              <tr key={driver.userId}>
                <td>{driver.username}</td>
                <td>{driver.password}</td>
                <td className="action-td"><center><button className="editBtn"><img className="edit-icon" src="/edit-icon.svg" onClick={() => openUpdateForm(driver.userId)}/></button>
                <button className="deleteBtn"><img className="delete-icon" src="/delete-icon.svg" onClick={(e) => deleteData(e, driver.userId)} /></button></center>
                </td>
            </tr>
            ))}
            </tbody>
            
          </table>
          <div className="edit-form" style={isActive2 ? {display: "flex"} : {display: "none"}}>
             <h2>Edit Delivery Driver Information</h2>
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


export default DeliveryDrivers;


