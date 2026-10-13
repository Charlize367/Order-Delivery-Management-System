import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import { Link } from "react-router-dom";

const CustomerLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const [showLogoutSuccessPopup, setShowLogoutSuccessPopup] = useState(false);

    useEffect(() => {
        if (location.state?.popup) {
            setShowLogoutSuccessPopup(true);
            setTimeout(() => setShowLogoutSuccessPopup(false), 3000);
        }
    }, [location]);

    const from = location.state?.from || "/browse";

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleGoToSignup = () => {
        navigate("/register", {
            state: {
                from: location.state?.from,
                action: location.state?.action
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const postData = {
                "username": username,
                "password": password,
                "role": "CUSTOMER"
            }
            const response = await axios.post(`${API_BASE_URL}/login`, postData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            login({ username: response.data.username, role: response.data.role, id: response.data.id }, response.data.token)

            if (location.state?.action === "CHECKOUT") {
                navigate(`/checkout/${response.data.id}`, { replace: true });
            } else {
                navigate(from, {
                    replace: true,
                    state: {
                        popup: "Logged in successfully"
                    }
                });
            }
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

    const goToKitchenLogin = (e) => {
        e.preventDefault();
        navigate('/kitchen_login');
    }

    const goToDispatcherLogin = (e) => {
        e.preventDefault();
        navigate('/dispatcher_login');
    }

    return (
        <section className="login-body">
            <div className="flex flex-wrap gap-3">
                <button className="block max-w-md cursor-pointer mt-3 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-[#3B2A20] transition-colors border border-[#3B2A20]/20 bg-transparent hover:bg-[#3B2A20]/5" onClick={goToAdLogin}>Login As Admin</button>
                <button className="block max-w-md cursor-pointer mt-3 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-[#3B2A20] transition-colors border border-[#3B2A20]/20 bg-transparent hover:bg-[#3B2A20]/5" onClick={goToDelLogin}>Login As Delivery Driver</button>
                <button className="block max-w-md cursor-pointer mt-3 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-[#3B2A20] transition-colors border border-[#3B2A20]/20 bg-transparent hover:bg-[#3B2A20]/5" onClick={goToKitchenLogin}>Login As Kitchen</button>
                <button className="block max-w-md cursor-pointer mt-3 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-[#3B2A20] transition-colors border border-[#3B2A20]/20 bg-transparent hover:bg-[#3B2A20]/5" onClick={goToDispatcherLogin}>Login As Dispatcher</button>
            </div>

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
                    <button className="text-[#3B2A20] underline cursor-pointer" type="button" onClick={handleGoToSignup}>Don't have an account? Sign up here.</button>
                </form>
            </div>
            {showLogoutSuccessPopup && (
                <div className="fixed top-5 right-5 z-50 flex w-full max-w-xs p-4 rounded-lg" role="alert">
                    <div className="flex items-center w-full p-4 text-white bg-[#3B2A20] rounded-lg shadow-sm">
                        <div className="inline-flex items-center justify-center w-8 h-8 text-[#8A9A5B] bg-[#8A9A5B]/20 rounded-lg">
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                            </svg>
                        </div>
                        <div className="ms-3 text-sm font-normal">{location.state?.logout || "Logged out successfully."}</div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default CustomerLogin;