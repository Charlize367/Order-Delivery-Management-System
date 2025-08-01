import { useState } from 'react'


const Login = () => {
    return(
        <section className="login-body">
        <div className="login-container">
            <h2>Login</h2>
            <input className="fields" type="text" placeholder="Username" />
            <input className="fields" type="password" placeholder="Password" />
            <input className="loginBtn" type="submit" value="Login" />
        </div>
</section>
    )

}



export default Login;
