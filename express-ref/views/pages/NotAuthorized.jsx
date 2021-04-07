import React from "react";
import Page from "../Page";
const title = "Permission Error";
module.exports = class NotAuthorized extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      stylesheet: "/css/NotAuthorized.css",
    });
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="not-authenticated-content">
            <h1>You do not have permission to access this!</h1>
            <form action="/logout" method="POST" id="logit">
              <input type="submit" value="Logout"></input>
            </form>
          </div>
        )}
      </>
    );
  }
};
