import React from "react";
module.exports = class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.message = props.message;
    this.backgroundColor = props.backgroundColor;
  }
  render() {
    return (
      <div className="toast-notification" id="toast-notification">
        <div className="toast-message" >
          {this.message}
        </div>
        <span id="toast-notification-close">&#10006;</span>
      </div>
    );
  }
};
