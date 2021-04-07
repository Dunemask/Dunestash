import React from "react";
import { serverUrls } from "../../api.json";
import "../../scss/pages/Profile.scss";
export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.user,
    };
  }
  render() {
    return (
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
                <img src={serverUrls.GET.avatar} id="panel-icon" alt="" />
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
                    placeholder={this.state.username}
                    defaultValue={this.state.username}
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
    );
  }
}
