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
            <div id="file-drop-area">
              <form className="upload-form">
                <input
                  type="file"
                  id="file-dropzone"
                  name="file-dropzone"
                  multiple
                ></input>
                <label className="button" htmlFor="file-dropzone">
                  <span id="file-select">Select Files</span> or Drag {"n'"} Drop
                  them here
                </label>
              </form>
            </div>
            <UploadDialog></UploadDialog>
          </div>
        )}
      </>
    );
  }
};
