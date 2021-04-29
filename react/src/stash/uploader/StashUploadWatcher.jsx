import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCheck,
  faRedoAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
//Local Imports
import "../scss/stash/StashUploadWatcher.scss";

//Constants
const successIcon = <FontAwesomeIcon icon={faCheck} />;
const errorIcon = <FontAwesomeIcon icon={faExclamationTriangle} />;
const retryIcon = <FontAwesomeIcon icon={faRedoAlt} />;
const cancelIcon = <FontAwesomeIcon icon={faTimes} />;
export default class StashUploadWatcher extends React.Component {
  constructor(props) {
    super(props);
    this.retryUpload = props.retryUpload;
    this.clearUpload = props.clearUpload;
  }

  isUploading() {
    return this.props.uploadProgress > 0 && this.props.uploadProgress !== 100;
  }

  progressIndicator() {
    if (this.props.uploadStatus === "Success") return successIcon;
    if (this.props.uploadStatus === "Error") return errorIcon;
    if (this.isUploading())
      return (
        <span className="file-watcher-progressbar-text">
          {this.props.uploadProgress}%
        </span>
      );
    return <span />;
  }

  watcherStatus() {
    var className = "file-watcher";
    if (this.isUploading() && this.props.uploadStatus !== "Error")
      className += " active";
    if (this.props.uploadStatus === "Success") className += " success";
    return className;
  }

  render() {
    return (
      <div className={this.watcherStatus()}>
        <div className="file-watcher-progressbar">
          <div
            className={
              this.props.uploadStatus === "Error"
                ? "file-watcher-progressbar-fill error"
                : "file-watcher-progressbar-fill"
            }
            style={{
              width:
                this.props.uploadStatus === "Error"
                  ? "100%"
                  : `${this.props.uploadProgress}%`,
            }}
          >
            <span className="file-watcher-progressbar-indicator">
              {this.progressIndicator()}
            </span>
          </div>
        </div>
        <span className="file-watcher-name">{this.props.file.name}</span>
        <div className="fud-actions">
          {this.props.uploadStatus === "Error" && (
            <span className="file-watcher-action" onClick={this.retryUpload}>
              {retryIcon}
            </span>
          )}
          <span className="file-watcher-action" onClick={this.clearUpload}>
            {cancelIcon}
          </span>
        </div>
      </div>
    );
  }
}
