import React from "react";
import Page from "../Page";
const title = "Profile";
module.exports = class Profile extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      scripts: ["profile.js"],
      userImage: props.userImage,
    });
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="profile-content">
            <div className="user-panel">
              <div className="panel-icon-container">
                <form
                  encType="multipart/form-data"
                  action="/profile?type=image-upload"
                  method="POST"
                  id="user-image-upload"
                >
                  <label>
                    <input
                      type="file"
                      name="user-image"
                      id="image-upload"
                      accept="image/png, image/jpeg"
                    />
                    <img
                      src={this.userImage}
                      id="panel-icon"
                      alt="Image not found"
                    />
                  </label>
                </form>
                <div className="user-information">
                  <form
                    action="/profile?type=apply-changes"
                    id="user-information-form"
                    method="POST"
                  >
                    <div className="username-entry-container">
                      <label htmlFor="username-entry">Username</label>
                      <input
                        type="text"
                        id="username-entry"
                        name="username-entry"
                        placeholder={this.username}
                        defaultValue={this.username}
                        required
                      ></input>
                    </div>
                    <div className="user-information-form-actions">
                      <div className="user-information-form-action">
                        <a href="profile">Revert</a>
                        <input type="submit" value="Apply"></input>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="other-actions">
                <a href="/profile?type=password">Change Password</a>
                <a href="logout">Logout</a>
              </div>
            </div>
          </div>
        )}
      </>
    ); //Close Return
  } //Close Render
};
