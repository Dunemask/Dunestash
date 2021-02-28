const db = require("../database.js");
import React from "react";
import Navbar from "./components/Navbar";
import Toast from "./components/ToastNotification";
module.exports = class Page extends React.Component {
  constructor(props) {
    super(props);
    let username, userImage;
    //Cannot simply use ? because a uuid could be 0 or 1
    if (props.uuid != undefined) {
      username = db.getUser(props.uuid);
      username = username.charAt(0).toUpperCase() + username.slice(1); //Uppercase first letter of their username
    }
    userImage = props.userImage ?? db.getUserImage(props.uuid);
    this.username = username;
    this.userImage = userImage;
    this.title = props.title;
    this.Navbar = <Navbar userImage={userImage} username={username}></Navbar>;
    this.Scripts = props.scripts;
    const status = { type: "Success", tag: "YEYY" };
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
            {this.Navbar}
            <Toast message="Hello World!" backgroundColor="green" />
            {child}
          </body>
        </html>
      ); //Close Return
    };
  }
};
