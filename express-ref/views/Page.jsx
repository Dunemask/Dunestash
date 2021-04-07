import db from "../extensions/database.js";
import React from "react";
import Navbar from "./components/Navbar";
import Toast from "./components/ToastNotification";
import { Web, StatusCode, Storage } from "../server-config.json";
module.exports = class Page extends React.Component {
  constructor(props) {
    super(props);
    let username, userImage;
    if (!!props.uuid) {
      username = db.getUser(props.uuid);
      username = username.charAt(0).toUpperCase() + username.slice(1); //Uppercase first letter of their username
    }
    this.username = username;
    this.userImage = props.userImage ?? db.getUserImage(props.uuid);
    this.title = props.title;
    this.Scripts = props.scripts;
    const statusType = (props.status && props.status.type) ?? "";
    const statusTag = (props.status && props.status.tag) ?? "";
    this.BuildPage = (child) => {
      return (
        <html>
          <head>
            <link rel="shortcut icon" href="favicon.png"></link>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=.75"
            ></meta>
            <link
              rel="stylesheet"
              type="text/css"
              href={props.stylesheet ?? `css/${this.title}.css`}
            ></link>
            <script src="js/extras/fontawesome.js" defer></script>
            <script src="js/toaster.js" defer></script>
            {this.Scripts &&
              this.Scripts.map((script, index) => (
                <script key={script} src={`js/${script}`} defer></script>
              ))}
            <title>{this.title}</title>
          </head>
          <body>
            <Navbar
              userImage={this.userImage}
              username={this.username}
            ></Navbar>
            <Toast message={statusTag} statusType={statusType} />
            {child}
          </body>
        </html>
      ); //Close Return
    };
  }
};
