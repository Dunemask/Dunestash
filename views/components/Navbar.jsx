import React from "react";
module.exports = class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.username = props.username;
    this.userImage = props.userImage;
    this.status = props.status;
  }
  statusNotification() {
    if (!this.status || Object.keys(this.status).length === 0) return;
    let tagType;
    if (this.status.type.toLowerCase().includes("success"))
      tagType = "status-indicator-success";
    if (this.status.type.toLowerCase().includes("error"))
      tagType = "status-indicator-fail";
    if (this.status.tag)
      return (
        <div className={tagType.toLowerCase()}>
          <h1>{this.status.tag}</h1>
        </div>
      );
    return (
      <div className={tagType.toLowerCase()}>
        <h1>{this.status.tag}</h1>
      </div>
    );
  }
  render() {
    return (
      <div className="navbar">
        {this.statusNotification()}
        <div className="user-display">
          <div className="user-icon-container">
            <input
              type="image"
              src={this.userImage}
              id="user-icon"
              alt="Image not found"
            />
          </div>
        </div>
        <div className="nav">
          <a href="/">Home</a>
          <a href="/files">Files</a>
          <a href="/upload">Upload</a>
        </div>
        <div id="user-control-toggle" style={{ display: "none" }}>
          <div className="user-control-container">
            <div className="login-links">
              <ul>
                {this.username && (
                  <li>
                    <a href="/profile">{this.username}</a>
                  </li>
                )}
                {this.username ? (
                  <li>
                    <a className="login-link" href="/logout">
                      Logout
                    </a>
                  </li>
                ) : (
                  <>
                    <li>
                      <a className="login-link" href="/login">
                        Login
                      </a>
                    </li>
                    <li>
                      <a className="login-link" href="/register">
                        Sign Up
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div> // <!--topbar-->
    );
  }
};
