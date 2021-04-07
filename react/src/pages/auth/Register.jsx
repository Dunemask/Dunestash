import React from "react";
import "../../scss/pages/Register.scss"
export default class Register extends React.Component {
  render() {
    return (
      <div className="register-wrapper">
        <div className="register">
          <form id="register-form" action="/register" method="POST">
            <div className="register-form-entry-container">
              <label htmlFor="confirm-password">Username:</label>
              <input
                type="text"
                className="register-form-entry"
                id="username"
                name="username"
                required
              />
            </div>
            <div className="register-form-entry-container">
              <label htmlFor="confirm-password">Create A Password:</label>
              <input
                type="password"
                className="register-form-entry"
                id="password"
                name="password"
                required
              />
            </div>
            <div className="register-form-entry-container">
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input
                type="password"
                className="register-form-entry"
                id="confirm-password"
                name="confirm-password"
                required
              />
            </div>
            <div className="register-form-entry-container">
              <input
                type="submit"
                value="Sign Up"
                className="register-form-entry"
              />
            </div>
          </form>
        </div>
      </div>
    ); //Close Return
  } //Close Render
}
