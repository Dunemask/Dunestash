import React from "react";
import Page from "../Page";
const title = "About";
module.exports = class Home extends Page {
  constructor(props) {
    super({ uuid: props.uuid, status: props.status, title });
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="about-container">
            <div className="about-wrapper">
              <div className="about">
                <h2>About</h2>
                <p>File sharing application written in NodeJS!</p>
              </div>
              <div className="github">
                <a href="https://github.com/dunemask">
                  <i
                    className="fab fa-github"
                    aria-hidden="true"
                    style={{ fontSize: "43px" }}
                  />
                </a>
              </div>
              <div className="copyright">
                <h1>Dunemask 2020 All Rights Reserved</h1>
              </div>
            </div>
          </div>
        )}
      </>
    ); //Close Return
  } //Close Render
};
