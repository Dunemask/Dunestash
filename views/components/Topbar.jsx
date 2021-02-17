var React = require("react");
class Topbar extends React.Component {
  constructor(props) {
    super(props);
    this.activeUsername = props.activeUsername;
    this.userImage = props.userImage;
    this.currentStatus = props.currentStatus;
    this.currentStatusTag = props.currentStatusTag;
  }
  extraStyle() {
    if (!this.currentStatus) return;
    let tagType;
    if (this.currentStatus.toLowerCase().includes("success"))
      tagType = "statusIndicatorSuccess";
    if (this.currentStatus.toLowerCase().includes("error"))
      tagType = "statusIndicatorFail";
    if (this.currentStatusTag)
      return (
        <div className={tagType}>
          <h1>{this.currentStatusTag}</h1>
        </div>
      );
    return (
      <div className={tagType}>
        <h1>{this.currentStatusTag}</h1>
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
                {this.activeUsername && (
                  <li>
                    <h3>
                      <a href="/profile">{this.activeUsername}</a>
                    </h3>
                  </li>
                )}
                {this.activeUsername ? (
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
}

module.exports = Topbar;
