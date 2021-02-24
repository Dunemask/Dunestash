import React from "react";
module.exports = class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.username = props.username;
    this.userImage = props.userImage;
    this.status = props.status;
    //this.currentStatus = props.currentStatus;
    //this.currentStatusTag = props.currentStatusTag;
  }
  extraStyle() {
    if (!this.status) return;
    let tagType;
    if (this.status.type.toLowerCase().includes("success"))
      tagType = "statusIndicatorSuccess";
    if (this.status.type.toLowerCase().includes("error"))
      tagType = "statusIndicatorFail";
    if (this.status.tag)
      return (
        <div className={tagType}>
          <h1>{this.status.tag}</h1>
        </div>
      );
    return (
      <div className={tagType}>
        <h1>{this.status.tag}</h1>
      </div>
    );
  }
  render() {
    return (
      <div className="topBar">
        <script type="text/javascript" src="/js/login.js"></script>
        {this.extraStyle()}
        <div className="userHandler">
          <div className="userIconContainer">
            <input
              type="image"
              src={this.userImage}
              id="userIcon"
              alt="Image not found"
            />
          </div>
        </div>
        <div className="navWrapper">
          <div className="nav" id="navbar">
            <a href="/">Home</a>
            <a href="/files">Files</a>
            <a href="/upload">Upload</a>
          </div>
        </div>
        <div id="userControlToggle" style={{ display: "none" }}>
          <div className="userControlSpacer" style={{ height: "65px" }}></div>
          <div className="userControlContainer">
            <div className="loginLinks">
              <ul>
                {this.username && (
                  <li>
                    <h3>
                      <a href="/profile">{this.username}</a>
                    </h3>
                  </li>
                )}
                {this.username ? (
                  <li>
                    <a className="loginLink" href="/logout">
                      Logout
                    </a>
                  </li>
                ) : (
                  <li>
                    <a className="loginLink" href="/login">
                      Login
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div> // <!--topbar-->
    );
  }
};
