import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

const KitchenLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
        try {
            const postData = {
                "username": username,
                "password": password,
                "role": "KITCHEN"
            }
            const response = await axios.post(`${API_BASE_URL}/login`, postData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            login({ username: response.data.username, role: response.data.role, id: response.data.id }, response.data.token)
            navigate('/kitchen');
            return true;

        } catch (error) {
            window.alert("Login failed");
            console.error('Login failed:', error);
            return false;
        }
    }

    return (
        <section className="login-body">
            <div className="w-full mx-auto max-w-md space-y-4 m-30 bg-[#F7F1E8] p-6 rounded-lg shadow-xs border border-[#3B2A20]/10">
                <form action="#" onSubmit={handleSubmit}>
                    <h5 className="text-xl font-semibold text-[#3B2A20] mb-6">Sign in to your account.</h5>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-[#3B2A20] mb-2.5 text-sm font-medium">Your username</label>
                        <input type="text" id="username" value={username} onChange={handleUsernameChange} className="bg-white text-[#3B2A20] border border-[0.5px] rounded-lg border-[#3B2A20]/20 text-sm focus:ring-[#A65A34] focus:border-[#A65A34] block w-full px-3 py-2.5 shadow-xs placeholder:text-[#3B2A20]/50" placeholder="Username" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-[#3B2A20] mb-2.5 text-sm font-medium">Your password</label>
                        <input type="password" id="password" value={password} onChange={handlePasswordChange} className="bg-white text-[#3B2A20] border border-[0.5px] rounded-lg border-[#3B2A20]/20 text-sm focus:ring-[#A65A34] focus:border-[#A65A34] block w-full px-3 py-2.5 shadow-xs placeholder:text-[#3B2A20]/50" placeholder="Password" required />
                    </div>

                    <button type="submit" className="block w-full cursor-pointer mt-10 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-white transition-colors bg-[#A65A34] hover:bg-[#8A9A5B]">Login</button>
                </form>
            </div>
        </section>
    )
}

export default KitchenLogin;