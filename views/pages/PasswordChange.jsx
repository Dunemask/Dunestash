import React from "react";
import Page from "../Page";
const title = "Password Change";
module.exports = class PasswordChange extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      stylesheet:"/css/Password.css"
    });
  }
  render() {
    return (
      <>
        {this.BuildPage(
                <div id="user-password-change">
                  <h2>Password</h2>
                  <div className="user-password-form">
                    <form
                      action="/profile?type=password"
                      method="POST"
                    >
                      <div className="user-password-form-entry">
                        <label htmlFor="originalPassword">
                          Original Password:
                        </label>
                        <input
                          id="original-password"
                          name="original-password"
                          type="password"
                          required
                        />
                      </div>
                      <div className="user-password-form-entry">
                        <label htmlFor="new-password">New Password:</label>
                        <input
                          id="new-password"
                          name="new-password"
                          type="password"
                          required
                        />
                      </div>
                      <div className="user-password-form-entry">
                        <label htmlFor="confirm-new-password">
                          Confirm Password:
                        </label>
                        <input
                          id="confirm-new-password"
                          name="confirm-new-password"
                          type="password"
                          required
                        />
                      </div>
                      <div className="user-password-form-entry" id="subbmission-options">
                        <div className="password-change-submit-container">
                          <input
                            type="submit"
                            value="Save"
                            id="password-change-submit-button"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
        )}
      </>
    );
  }
};
