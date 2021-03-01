import React from "react";
module.exports = class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.message = props.message;
    this.backgroundColor = props.backgroundColor;
    this.statusType = props.statusType ?? "";
    this.classList = "toast-notification ";
    if (!!this.statusType) {
      this.classList += `toast-${this.statusType.toLowerCase()} `;
    }
    if (!!this.message) {
      this.classList += "toast-notification-on ";
    }
  }
  render() {
    return (
      <div className={this.classList} id="toast-notification">
        <div id="toast-message">{this.message}</div>
        <span id="toast-notification-close">&#10006;</span>
      </div>
    );
  }
};
