const db = require("../database.js");
import React from "react";
import Navbar from "./components/Navbar";
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
    this.NavbarArguments = {
      userImage,
      username,
      status: props.status,
    };
    this.username = username;
    this.userImage = userImage;
    this.title = props.title;
    this.Favicon = <link rel="shortcut icon" href="/favicon.png"></link>;
    this.Navbar = <Navbar {...this.NavbarArguments}> </Navbar>;
    this.Stylesheet = (
      <link
        rel="stylesheet"
        type="text/css"
        href={props.stylesheet ?? `/css/${this.title}.css`}
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
    this.Scripts = props.scripts;
    this.NavScript = (
      <script type="text/javascript" src="/js/navbar.js" defer></script>
    );
    this.BuildPage = (child) => {
      return (
        <html>
          <head>
            {this.Favicon}
            {this.ViewportMeta}
            {this.Stylesheet}
            {this.NavScript}
            {this.FontAwesome}
            {this.Scripts &&
              this.Scripts.map((script, index) => (
                <script key={script} src={`/js/${script}`} defer></script>
              ))}
            <title>{this.title}</title>
          </head>
          <body>
            {this.Navbar}
            {child}
          </body>
        </html>
      ); //Close Return
    };
  }
};
