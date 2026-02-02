import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const AdminLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
            
        <div class="w-full mx-auto max-w-md space-y-4 m-30 bg-[#222324] p-6 rounded-lg shadow-xs">
    <form action="#" onSubmit={handleSubmit}>
        <h5 class="text-xl font-semibold text-white text-heading mb-6">Sign in to your account.</h5>
        <div class="mb-4">
            <label for="username" class="block text-white mb-2.5 text-sm font-medium text-heading">Your username</label>
            <input type="username" id="username" value={username} onChange={handleUsernameChange} class="bg-transparent text-white border border-[0.5px] rounded-lg border-gray-100 border-default-small text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="Username" required />
        </div>
        <div>
            <label for="password" class="block text-white mb-2.5 text-sm font-medium text-heading">Your password</label>
            <input type="password" id="password" value={password} onChange={handlePasswordChange} class="bg-transparent text-white border border-[0.5px] rounded-lg border-gray-100 border-default-small text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="Password" required />
        </div>
        
        <button type="submit" class="block w-full  mt-10 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-white transition-colors hover:bg-transparent bg-gradient-to-r from-[#56C789] to-[#096E22] hover:text-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-white">Login</button>
       
    </form>
</div>

</section>
    )

}



export default AdminLogin;
