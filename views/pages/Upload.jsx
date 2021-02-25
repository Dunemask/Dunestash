import React from "react";
import Page from "../Page";
const title = "Upload";
module.exports = class Upload extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      scripts: ["upload.js"],
    });
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="upload-files-content">
            <div id="file-wrapper">
              <div className="file-selection-container">
                <div className="file-selection">
                  <form id="file-upload-form">
                    <h1>Upload your file</h1>
                    <label>
                      <input
                        type="file"
                        name="user-selected-upload-file"
                        id="user-selected-upload-file"
                      />
                      <br />
                      <span className="file-select-button">
                        Select <i className="fa fa-upload"></i>
                      </span>
                    </label>
                    <label>
                      <span className="file-upload-button">
                        <input
                          type="submit"
                          value="Upload"
                          id="upload-submit-button"
                        />
                      </span>
                    </label>
                  </form>
                </div>
              </div>
              <div className="selected-file-container">
                <div id="lower-file-data">
                  <div id="selected-file">
                    <h2>No File Selected!</h2>
                  </div>
                  <div id="file-error-indicator"></div>
                  <div
                    className="upload-progress-bar"
                    id="upload-progress-bar"
                    style={{ display: "none" }}
                  >
                    <div className="upload-progress-bar-fill">
                      <span className="upload-progress-bar-text">0.00%</span>
                    </div>
                  </div>
                  <div className="processing" style={{ display: "none" }}>
                    <h2>Processing upload</h2>
                    <div className="loader-wrapper">
                      <div className="loader"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
