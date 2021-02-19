import React from "react";
module.exports = class PasswordChange extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="profile-content">
        <div className="userPanel">
          <div id="login-box">
            <div id="login-form">
              <h2>Password</h2>
              <div className="formy">
                <form
                  action="/passwordChange"
                  method="POST"
                  id="passwordChangeRequest"
                >
                  <div className="formelm">
                    <label htmlFor="originalPassword">Original Password:</label>
                    <input
                      id="originalPassword"
                      name="originalPassword"
                      type="password"
                      required
                    />
                  </div>
                  <div className="formelm">
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                    />
                  </div>
                  <div className="formelm">
                    <label htmlFor="confirmNewPassword">
                      Confirm Password:
                    </label>
                    <input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      type="password"
                      required
                    />
                  </div>
                  <div className="formelm" id="subbmission-options">
                    <div className="passwordSubmitButtonContainer">
                      <input
                        type="submit"
                        value="Save"
                        id="passwordSubmitButton"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
