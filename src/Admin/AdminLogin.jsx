import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';




const AdminLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    console.log(API_BASE_URL);
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
                    "role" : "ADMIN"
                }
                const response = await axios.post(`${API_BASE_URL}/login`, postData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
               
                login({username: response.data.username, role: response.data.role, id: response.data.id}, response.data.token)
                navigate('/catalog_dashboard');
                return true;

            } catch (error) {
                window.alert("Login failed");
                console.error('Login failed:', error);
                console.log(response);
                console.log(login);
                return false;
                
            }

        }


    return(
        <section className="login-body">
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
            <input className="fields" type="text" placeholder="Username" value={username} onChange={handleUsernameChange}  />
            <input className="fields" type="password" placeholder="Password" value={password} onChange={handlePasswordChange}/>
            <input className="loginBtn" type="submit" value="Login" />
            </form>
        </div>
</section>
    )

}



export default AdminLogin;
