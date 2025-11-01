function Login() {
    return(
        <div id="login-div" className="box">
            <h2 className="primary-text">LOGIN</h2>
            <input type="text" id="login-name" className="secondary-text accent" placeholder="USERNAME"/>
            <input type="password" id="login-password" className="secondary-text accent" placeholder="PASSWORD"/>
            <a href="" className="primary-text">REGISTER</a>
        </div>
    );
};

export default Login;