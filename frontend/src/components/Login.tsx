import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import type { MouseEvent } from "react";

function Login() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loginName, setLoginName] = useState("");
    const [loginPassword, setPassword] = useState("");

    async function doLogin(e: MouseEvent) {
        e.preventDefault();

        try {
            const result = await fetch("http://localhost:3000/user/login", {
                method : "POST",
                body : JSON.stringify({username: loginName, password: loginPassword}),
                headers : {
                    "Content-Type" : "application/json"
                }
            });
            
            if (!result.ok) {
                const loginMessage = await result.json();
                setMessage(loginMessage.message);
            }
            else {
                setMessage("");
                navigate("/userConstellations");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div id="login-div" className="box">
            <h2 className="primary-text">LOGIN</h2>
            <input type="text" id="login-name" className="secondary-text accent" placeholder="USERNAME" onChange={(e) => setLoginName(e.target.value)}/>
            <input type="password" id="login-password" className="secondary-text accent" placeholder="PASSWORD" onChange={(e) => setPassword(e.target.value)}/>
            <button id="login-button" className="secondary-text accent" onClick={doLogin}>SUBMIT</button>
            <span id="login-result">{message}</span>
            <Link to="/register" className="primary-text">REGISTER</Link>
        </div>
    );
};

export default Login;