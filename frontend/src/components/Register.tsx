function Register() {
    return(
        <div id="register-div" className="box">
            <h2 className="primary-text">REGISTER</h2>
            <input type="text" id="register-name" className="secondary-text accent" placeholder="USERNAME"/>
            <input type="password" id="register-password" className="secondary-text accent" placeholder="PASSWORD"/>
            <input type="password" id="confirm-password" className="secondary-text accent" placeholder="CONFIRM PASSWORD"/>
            <button id="register-button" className="secondary-text accent">SUBMIT</button>
            <a href="">LOGIN</a>
        </div>
    );
}

export default Register;