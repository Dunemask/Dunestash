const db = require("../database.js");
import React from "react";
import Navbar from "./components/Navbar";
module.exports = class Page extends React.Component {
  constructor(props) {
    console.log(props);
    super(props);
    let username, userImage;
    //Cannot simply use ? because a uuid could be 0 or 1
    if (props.uuid != undefined) {
      username = db.getUser(props.uuid);
      username = username.charAt(0).toUpperCase() + username.slice(1); //Uppercase first letter of their username
    }
    userImage = props.userImage ?? db.getUserImage(props.uuid);
    this.NavbarArguments = {
      userImage,
      username,
      status: props.status,
    };
    this.Favicon = <link rel="shortcut icon" href="/favicon.png"></link>;
    this.Navbar = <Navbar {...this.NavbarArguments}> </Navbar>;
    this.Stylesheet = (
      <link
        rel="stylesheet"
        type="text/css"
        href={`/css/${props.title}.css`}
      ></link>
    );
    this.FontAwesome = (
      <script src="https://use.fontawesome.com/86339af6a5.js"></script>
    );
    this.ViewportMeta = (
      <meta
        name="viewport"
        content="width=device-width, initial-scale=.75"
      ></meta>
    );
    this.BuildPage = (child) => {
      return (
        <html>
          <head>
            {this.Favicon}
            {this.ViewportMeta}
            {this.FontAwesome}
            {this.Stylesheet}
          </head>
          <body>
          {this.Navbar}
          {child}</body>
        </html>
      ); //Close Return
    };
  }
};
