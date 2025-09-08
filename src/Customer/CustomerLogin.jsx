import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BrowseCatalog from "./BrowseCategory.jsx"
import { useAuth } from '../Auth/AuthContext';
import { Link } from "react-router-dom";

const CustomerLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

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
                const postData = {
                    "username" : username,
                    "password" : password,
                    "role" : "CUSTOMER"
                }
                const response = await axios.post(`${API_BASE_URL}/login`, postData, {
                    headers: {
                        
                        'Content-Type': 'application/json'
                    }
                });
                 login({username: response.data.username, role: response.data.role, id: response.data.id}, response.data.token)
                navigate('/browse');
                return true;

            } catch (error) {
                 window.alert("Login failed");
                console.error('Login failed:', error);
                return false;
            }

        }

        const goToAdLogin = (e) => {
            e.preventDefault();
            navigate('/admin_login');
        }

        const goToDelLogin = (e) => {
            e.preventDefault();
            navigate('/delivery_login');
        }


    return(
        <section className="login-body">
            <div className="otherLogin">
                <button className="goToAdminLogin" onClick={goToAdLogin}>Login As Admin</button>
                <button className="goToDeliveryLogin" onClick={goToDelLogin}>Login As Delivery Driver</button>
            </div>
        <div className="form-container">
            <h2>Sign In.</h2>
            <form onSubmit={handleSubmit}>
            <input className="fields" type="text" placeholder="Username" value={username} onChange={handleUsernameChange}  />
            <input className="fields" type="password" placeholder="Password" value={password} onChange={handlePasswordChange}/>
            <input className="loginBtn" type="submit" value="Login" />
            </form>
            <Link className="goToRegister" to ="/register">Don't have an account? Sign up here.</Link>
            
        </div>
</section>
    )

}



export default CustomerLogin;
