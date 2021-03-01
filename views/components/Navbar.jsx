import React from "react";
import Toast from "./ToastNotification";
module.exports = class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.username = props.username;
    this.userImage = props.userImage;
  }
  render() {
    return (
      <div className="navbar">
        <div className="user-display">
          <div className="user-icon-container">
            <a href="profile">
              <img
                type="image"
                src={this.userImage}
                id="user-icon"
                alt="Image not found"
              />
            </a>
          </div>
        </div>
        <div className="nav">
          <a href="/">Home</a>
          <a href="my-files">Files</a>
          <a href="upload">Upload</a>
        </div>
      </div>
    );
  }
};
