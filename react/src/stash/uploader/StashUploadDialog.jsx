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
import StashUploadWatcher from "./StashUploadWatcher";
import "../scss/stash/StashUploadDialog.scss";
//Icons List
const successIcon = <FontAwesomeIcon icon={faCloudUploadAlt} />;
const errorIcon = <FontAwesomeIcon icon={faExclamationTriangle} />;
const retryIcon = <FontAwesomeIcon icon={faRedoAlt} />;
const cancelIcon = <FontAwesomeIcon icon={faTimes} />;
const upIcon = <FontAwesomeIcon icon={faAngleUp} />;
const downIcon = <FontAwesomeIcon icon={faAngleDown} />;
export default class StashUploadDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMinimized: false,
    };
  }

  fudDisplay() {
    const uploadLength = Object.values(this.props.uploads).length;
    var className = "fud";
    if (this.props.fadeOnClear && uploadLength === 0) {
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
        <div id="fud-header">
          <div id="fud-header-status">
            <span id="fud-status-icon">
              {this.props.errorCount > 0 ? errorIcon : successIcon}
              <span
                className="fud-error-wrapper"
                style={{ display: this.props.errorCount > 0 ? "flex" : "none" }}
              >
                <i className="fas fa-circle"></i>
                <span id="fud-error-count">{this.props.errorCount}</span>
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
              onClick={this.props.retryAll}
            >
              {retryIcon}
            </span>
            <span
              id="fud-clear"
              className="fud-action"
              onClick={this.props.clearAll}
            >
              {cancelIcon}
            </span>
          </div>
        </div>
        <div id="fud-queued-files">
          {Object.values(this.props.uploads).map(
            (upload, index) =>
              upload && (
                <StashUploadWatcher
                  file={upload.file}
                  key={upload.uploadUuid}
                  retryUpload={() => this.props.retryUpload(upload.uploadUuid)}
                  clearUpload={() => this.props.clearUpload(upload.uploadUuid)}
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
