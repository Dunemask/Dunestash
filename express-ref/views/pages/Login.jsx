import React from "react";
import Page from "../Page";
const title = "Login";
module.exports = class Loginpage extends Page {
  constructor(props) {
    super({ uuid: props.uuid, status: props.status, title });
  }
  render() {
    return (
      <>
        {this.BuildPage(
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
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>

                  <div className="login-form-entry">
                    <div className="login-form-actions">
                      <a href="register" className="register-link">Register</a>
                      <input type="submit" value="Login" />
                  </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
