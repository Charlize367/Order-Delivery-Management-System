import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const CreateCustomerReg = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();



  const from = location.state?.from || "/browse";

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
                const response = await axios.post(`${API_BASE_URL}/register`, postData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response);
                window.alert("Account creation successful. You may now login");
                navigate("/login", {
                replace: true,
                state: {
                    popup: "✅ Account created successfully. You may now login.",
                    action: location.state?.action,
                    quantity: location.state?.quantity
                }
                });
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
  <div className="w-full mx-auto max-w-md space-y-4 m-30 bg-[#222324] p-6 rounded-lg shadow-xs">
    <form onSubmit={handleSubmit}>
      <h5 className="text-xl font-semibold text-white text-heading mb-6">
        Create your account
      </h5>

      <div className="mb-4">
        <label
          htmlFor="username"
          className="block text-white mb-2.5 text-sm font-medium text-heading"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
          required
          className="bg-transparent text-white border border-[0.5px] rounded-lg border-gray-100 border-default-small text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-white mb-2.5 text-sm font-medium text-heading"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          required
          className="bg-transparent text-white border border-[0.5px] rounded-lg border-gray-100 border-default-small text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="block text-white mb-2.5 text-sm font-medium text-heading"
        >
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Confirm Password"
          required
          className="bg-transparent text-white border border-[0.5px] rounded-lg border-gray-100 border-default-small text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-gray-400"
        />
      </div>

      <button
        type="submit"
        className="block w-full cursor-pointer mt-6 mb-5 rounded-lg px-12 py-3 text-sm font-medium text-white transition-colors bg-gradient-to-r from-[#56C789] to-[#096E22] hover:text-indigo-600 hover:bg-transparent dark:hover:bg-indigo-700 dark:hover:text-white"
      >
        Create Account
      </button>
    </form>
  </div>
</section>

    )

}


export default CreateCustomerReg;
