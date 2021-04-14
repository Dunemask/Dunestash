import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { serverUrls } from "../api.json";
import Files from "../pages/files/Files.jsx";
import Profile from "../pages/profile/Profile.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
    };
  }

  render() {
    return (
      <Router>
        <div className="navbar">
          <div className="user-display">
            <div className="user-icon-container">
              <Link to="/profile">
                <img
                  src={serverUrls.GET.avatar}
                  onError={(ev) => {
                    ev.target.src = "/extras/blank_user.svg";
                  }}
                  alt=" "
                />
              </Link>
            </div>
          </div>
          <div className="nav">
            <Link to="/">Stash</Link>
          </div>
        </div>
        <Switch>
          <Route exact path="/">
            <Files />
          </Route>
          <Route path="/profile">
            <Profile user={this.state.username} />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
        </Switch>
      </Router>
    );
  }
}
