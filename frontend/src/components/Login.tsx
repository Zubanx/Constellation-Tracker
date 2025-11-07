import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function Login() {
    function handleSetLoginName(e: any) : void {
        setLoginName(e.target.value);
    }

    function handleSetPassword(e: any) : void {
        setPassword(e.target.value);
    }

    
    
    const navigate = useNavigate();
    const [message,setMessage] = useState('');
    const [loginName,setLoginName] = useState('');
    const [loginPassword,setPassword] = useState('');

    return(
        <div id="login-div" className="box">
            <h2 className="primary-text">LOGIN</h2>
            <input type="text" id="login-name" className="secondary-text accent" placeholder="USERNAME" onChange={handleSetLoginName}/>
            <input type="password" id="login-password" className="secondary-text accent" placeholder="PASSWORD" onChange={handleSetPassword}/>
            <button id="login-button" className="secondary-text accent">SUBMIT</button>
            <span id="login-result">{message}</span>
            <Link to="/register" className="primary-text">REGISTER</Link>
        </div>
    );
};

export default Login;