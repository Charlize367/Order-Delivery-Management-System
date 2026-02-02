import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const CreateCustomerReg = () => {

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

    const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(username);

        if(password === confirmPassword) {
            try {
                const postData = {
                    "username" : username,
                    "password" : password,
                    "enabled" : true,
                    "role" : "CUSTOMER"
                }
                const response = await axios.post(`${API_BASE_URL}/users/register`, postData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response);
                window.alert("Account creation successful. You may now login");
                navigate('/login');
                return true;

            } catch (error) {
                console.error('Account Creation failed:', error);
                window.alert('Account Creation failed');
                return false;
            }
          } else {
            window.alert("Passwords do not match.");
          }

        }


    return(
        <section className="login-body">
        <div className="form-container">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
            <input className="fields" type="text" placeholder="Username" value={username} onChange={handleUsernameChange}  />
            <input className="fields" type="password" placeholder="Password" value={password} onChange={handlePasswordChange}/>
            <input className="fields" type="password" placeholder="Password" value={confirmPassword} onChange={handleConfirmPasswordChange}/>
            <input className="loginBtn" type="submit" value="Create Account" />
            </form>
        </div>
</section>
    )

}


export default CreateCustomerReg;
