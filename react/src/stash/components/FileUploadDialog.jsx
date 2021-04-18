//Module Imports
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCloudUploadAlt,
  faRedoAlt,
  faTimes,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
//Local Imports
import FileWatcher from "./FileWatcher";
import WatcherActions from "../helpers/watcheractions.js";
import Display from "../helpers/display.js";
import Upload from "../helpers/upload.js";
//Icons List
const successIcon = <FontAwesomeIcon icon={faCloudUploadAlt} />;
const errorIcon = <FontAwesomeIcon icon={faExclamationTriangle} />;
const retryIcon = <FontAwesomeIcon icon={faRedoAlt} />;
const cancelIcon = <FontAwesomeIcon icon={faTimes} />;
const upIcon = <FontAwesomeIcon icon={faAngleUp} />;
const downIcon = <FontAwesomeIcon icon={faAngleDown} />;
export default class FileUploadDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploads: {},
      errorCount: 0,
      isMinimized: false,
      fadeOnClear: false,
    };
    var f;
    for (f in WatcherActions) {
      this[f] = WatcherActions[f].bind(this);
    }
    for (f in Display) {
      this[f] = Display[f].bind(this);
    }
    for (f in Upload) {
      this[f] = Upload[f].bind(this);
    }
  }

  fudDisplay() {
    const uploadLength = Object.values(this.state.uploads).length;
    var className = "fud";
    if (this.state.fadeOnClear && uploadLength === 0) {
      return (className += " fud-fade");
    }
    if (this.state.isMinimized) return (className += " fud-minimized");
    if (uploadLength > 0) {
      return (className += " fud-maximized");
    }
    return className;
  }
  render() {
    return (
      <div className={this.fudDisplay()}>
        <input
          type="file"
          id="file-dropzone"
          name="file-dropzone"
          multiple
          onChange={this.handleSelectedFiles}
        ></input>
        <div id="fud-header">
          <div id="fud-header-status">
            <span id="fud-status-icon">
              {this.state.errorCount > 0 ? errorIcon : successIcon}
              <span
                className="fud-error-wrapper"
                style={{ display: this.state.errorCount > 0 ? "flex" : "none" }}
              >
                <i className="fas fa-circle"></i>
                <span id="fud-error-count">{this.state.errorCount}</span>
              </span>
            </span>
          </div>
          <div className="fud-header-title-wrapper">
            <span
              id="fud-header-title"
              onClick={() =>
                this.setState({ isMinimized: !this.state.isMinimized })
              }
            >
              Uploads
              <span id="fud-minimize">
                {this.state.isMinimized && upIcon}
                {!this.state.isMinimized && downIcon}
              </span>
            </span>
          </div>
          <div className="fud-actions" id="header-actions">
            <span
              id="fud-retry"
              className="fud-action"
              onClick={() => this.retryAll()}
            >
              {retryIcon}
            </span>
            <span
              id="fud-clear"
              className="fud-action"
              onClick={() => this.clearAll()}
            >
              {cancelIcon}
            </span>
          </div>
        </div>
        <div id="fud-queued-files">
          {Object.values(this.state.uploads).map(
            (upload, index) =>
              upload && (
                <FileWatcher
                  file={upload.file}
                  key={upload.uploadUuid}
                  retryUpload={() => this.retryUpload(upload.uploadUuid)}
                  clearUpload={() => this.clearUpload(upload.uploadUuid)}
                  uploadProgress={upload.progress}
                  uploadStatus={upload.status}
                />
              )
          )}
        </div>
      </div>
    );
  }
}
