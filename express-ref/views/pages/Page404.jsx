import React from "react";
import Page from "../Page";
const title = "Error 404";
module.exports = class Page404 extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      stylesheet: "/css/Page404.css",
    });
  }

  render() {
    return (
      <>
        {this.BuildPage(<h1> The page you are looking for does not exist</h1>)}
      </>
    );
  }
};
