import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {

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
                const credentials = btoa(`${username}:${password}`);
                const response = await axios.post('http://localhost:8083/token', {}, {
                    headers: {
                        'Authorization' : `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });
                const token = response.data;
                localStorage.setItem('jwtToken', token);
                console.log(token);
                console.log(response);
                navigate('/catalog_dashboard');
                return true;

            } catch (error) {
                console.error('Login failed:', error);
                return false;
            }

        }


    return(
        <section className="login-body">
        <div className="login-container">
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



export default Login;
