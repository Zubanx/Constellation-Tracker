function Login() {
    return(
        <div id="login-div">
            <h2 className="primary-text">LOGIN</h2>
            <input type="text" id="login-name" className="secondary-text" placeholder="USERNAME"/>
            <input type="password" id="login-password" className="secondary-text" placeholder="PASSWORD"/>
        </div>
    );
};

export default Login;