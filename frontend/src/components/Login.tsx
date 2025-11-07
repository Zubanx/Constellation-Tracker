import { Link } from "react-router-dom";

function Login() {
    return(
        <div id="login-div" className="box">
            <h2 className="primary-text">LOGIN</h2>
            <input type="text" id="login-name" className="secondary-text accent" placeholder="USERNAME"/>
            <input type="password" id="login-password" className="secondary-text accent" placeholder="PASSWORD"/>
            <button id="login-button" className="secondary-text accent">SUBMIT</button>
            <Link to="/register" className="primary-text">REGISTER</Link>
        </div>
    );
};

export default Login;