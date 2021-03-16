import React from "react";
import Page from "../Page";
import UploadDialog from "../components/UploadDialog";
import { easyDate } from "../../extensions/prerender.js";
const title = "Upload";
module.exports = class Upload extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      scripts: ["files.js", "upload.js"],
    });
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="file-drive">
            <div id="abar">
              <div className="abar-actions">
                <span className="medium-spacer"></span>
                <label className="upload-button" htmlFor="file-dropzone">
                  Upload <i className="fas fa-cloud-upload-alt"></i>
                </label>
                <span className="medium-spacer"></span>
                <div className="file-searchbar">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    id="file-search"
                    name="file-search"
                    placeholder="Search"
                    autoComplete="off"
                  ></input>
                </div>
              </div>
            </div>
            <input
              type="file"
              id="file-dropzone"
              name="file-dropzone"
              multiple
            ></input>
            <div className="user-files" id="file-drop-area">
              <h3 className="files-header">My Files</h3>
              <div className="files" id="owned-files"></div>
            </div>
            <div className="user-dialogs">
              <UploadDialog></UploadDialog>
              <div id="fud-drag-drop-notification">
                <div id="fud-drag-drop-message">
                  <i className="fas fa-upload"></i>
                  {" Drag and drop files above to upload them."}
                </div>
              </div>
              <div className="processing-indicator">
                <i className="fas fa-sync"></i>
                <span className="processing-counter"></span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
