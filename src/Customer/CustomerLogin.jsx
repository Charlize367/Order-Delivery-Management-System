import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BrowseCatalog from "./BrowseCatalog.jsx"

const CustomerLogin = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

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
                const response = await axios.post('http://localhost:8083/login', postData, {
                    headers: {
                        
                        'Content-Type': 'application/json'
                    }
                });
                const token = response.data;
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('username', username);
                console.log(token);
                console.log(response);
                navigate('/browse');
                return true;

            } catch (error) {
                console.error('Login failed:', error);
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



export default CustomerLogin;
