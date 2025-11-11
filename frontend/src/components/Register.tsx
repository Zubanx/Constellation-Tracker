import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

function Register() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirmPass, setRegisterConfirmPass] = useState("");

    async function doRegister(e: MouseEvent) {
        e.preventDefault();

        try {
            const result = await fetch("http://localhost:3000/user/signup", {

            });
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div id="register-div" className="box">
            <h2 className="primary-text">REGISTER</h2>
            <input type="text" id="register-name" className="secondary-text accent" placeholder="USERNAME" onChange={(e) => setRegisterName(e.target.value)}/>
            <input type="email" id="register-email" className="secondary-text accent" placeholder="EMAIL" onChange={(e) => setRegisterEmail(e.target.value)}/>
            <input type="password" id="register-password" className="secondary-text accent" placeholder="PASSWORD" onChange={(e) => setRegisterPassword(e.target.value)}/>
            <input type="password" id="confirm-password" className="secondary-text accent" placeholder="CONFIRM PASSWORD" onChange={(e) => setRegisterConfirmPass(e.target.value)}/>
            <button id="register-button" className="secondary-text accent" onClick={doRegister}>SUBMIT</button>
            <span id="register-result" className="secondary-text">{message}</span>
            <Link to="/" className="primary-text">LOGIN</Link>
        </div>
    );
}

export default Register;