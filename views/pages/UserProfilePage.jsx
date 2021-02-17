var React = require('react');
module.exports = class UserProfilePage extends React.Component {
  constructor(props) {
  super(props);
  }
  render(){
  return (
  <div className="profile-content">
            <div className="userPanel">
              <div className="panelIconContainer">
              <form encType="multipart/form-data" action="/userImageUpload" method="POST" id="userImageUpload" >
              <label>
                <input type="file" name="userImage" id="imageUpload" accept="image/png, image/jpeg"/>
                <img src={this.props.userImage}
                id="panelIcon"
                alt="Image not found"/>
                </label>
              </form>
                <div className="userFields">
                <form action="/fieldsChange" id="fieldsChange" method="POST">
                  <div className="usernameFieldContainer">
                  <label htmlFor="usernameField">Username</label>
                  <input type="text" id="usernameField" name="usernameField" placeholder={this.props.activeUsername} defaultValue={this.props.activeUsername}  required></input>
                  </div>
                  <div className="changePasswordTriggerWrapper">
                    <a href="profile-password-change">Change Password</a>
                  </div>
                  <div className="form-actions">
                      <div className="form-action">
                      <a href="profile">Revert</a>
                      </div>
                      <div className="form-action">
                      <input type="submit" value="Apply"></input>
                      </div>
                  </div>
                </form>
                </div>
              </div>
            </div>
            <script type="text/javascript" src="/js/profile.js"></script>
          </div>
  );}
}
