import React from "react";
import "../../scss/pages/Login.scss"
export default class Login extends React.Component {
  render() {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-form">
            <form action="login" method="POST" id="logit">
              <div className="login-form-entry">
                <label htmlFor="username">Username:</label>
                <input id="username" name="username" type="text" required />
              </div>
              <div className="login-form-entry">
                <label id="password-entry-label" htmlFor="password">
                  Password:
                </label>
                <input id="password" name="password" type="password" required />
              </div>
              <div className="login-form-entry">
                <div className="login-form-actions">
                  <a href="register" className="register-link">
                    Register
                  </a>
                  <input type="submit" value="Login" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
