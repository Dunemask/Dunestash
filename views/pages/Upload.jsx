import React from "react";
import Page from "../Page";
import UploadDialog from "../components/UploadDialog";
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
            <label className="upload-button" htmlFor="file-dropzone">
              Upload <i className="fas fa-cloud-upload-alt"></i>
            </label>
            <div id="file-drop-area">
              <input
                type="file"
                id="file-dropzone"
                name="file-dropzone"
                multiple
              ></input>
            </div>
            <UploadDialog></UploadDialog>
            <div id="fud-drag-drop-notification">
              <div id="fud-drag-drop-message">
                <i className="fas fa-upload"></i>
                {" Drag and drop files above to upload them."}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
