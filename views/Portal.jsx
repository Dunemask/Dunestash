const db = require("../database.js");
const fs = require("fs");
import React from "react";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import DownloadsPage from "./pages/DownloadsPage";
import UploadFilesPage from "./pages/UploadFilesPage";
import UserProfilePage from "./pages/UserProfilePage";
import PasswordChange from "./pages/PasswordChange";
import SharePage from "./pages/SharePage";
import LoginPage from "./server-handlers/LoginPage";
import PageNotFound from "./server-handlers/PageNotFound";
import UserNotAuthenticated from "./server-handlers/UserNotAuthenticated";
module.exports = class Portal extends React.Component {
  constructor(props) {
    super(props);
    let activeUsername;
    if (props.userId != undefined) {
      activeUsername = db.getUser(props.userId);
      activeUsername =
        activeUsername.charAt(0).toUpperCase() + activeUsername.slice(1);
    }
    let userImage = props.overrideImagePath;
    if (!userImage) {
      userImage = db.getUserImage(props.userId);
    }
    let currentStatus = props.currentStatus;
    let currentStatusTag = props.currentStatusTag;
    this.NavbarArguments = {
      userImage,
      activeUsername,
      currentStatus,
      currentStatusTag,
    };
    this.pageContent = props.pageContent;
  }
  render() {
    this.buildPageContent = function () {
      switch (this.pageContent) {
        case "MainPage":
          return { content: <MainPage />, title: "Home" };
          break;
        case "DownloadsPage":
          return {
            content: <DownloadsPage {...this.props.downloadsPageProps} />,
            title: this.props.downloadsPageProps.title,
          };
          break;
        case "UploadFilesPage":
          return { content: <UploadFilesPage />, title: "Upload" };
          break;
        case "UserProfilePage":
          return {
            content: <UserProfilePage {...this.NavbarArguments} />,
            title: "My Profile",
          };
          break;
        case "LoginPage":
          return { content: <LoginPage />, title: "Login" };
          break;
        case "FailurePage":
          return { content: <FailurePage />, title: "Login" };
          break;
        case "PageNotFound":
          return { content: <PageNotFound />, title: "404 No Cookies" };
          break;
        case "UserNotAuthenticated":
          return {
            content: <UserNotAuthenticated />,
            title: "User Not Authorized",
          };
          break;
        case "PasswordChange":
          return { content: <PasswordChange />, title: "Password Change" };
          break;
        case "SharePage":
          return {
            content: <SharePage {...this.props.target} />,
            title: "Share",
          };
          break;
      }
    };
    return (
      <html>
        <head>
          <link rel="shortcut icon" href="/favicon.png"></link>
          <link
            rel="stylesheet"
            type="text/css"
            href={`/css/${this.pageContent}.css`}
          ></link>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=.75"
          ></meta>
          <script src="https://use.fontawesome.com/86339af6a5.js"></script>
          <title>{this.buildPageContent().title}</title>
        </head>
        <body>
          <Navbar {...this.NavbarArguments}> </Navbar>
          <div className="page-content">{this.buildPageContent().content}</div>
        </body>
      </html>
    ); //Close Return
  } //Close Render
};
