import React from "react";
import axios, { CancelToken } from "axios";
import FileWatcher from "./FileWatcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  faExclamationTriangle,
  faCloudUploadAlt,
  faRedoAlt,
  faTimes,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { serverUrls, serverFields } from "../../../api.json";
//Icons List
const successIcon = <FontAwesomeIcon icon={faCloudUploadAlt} />;
const errorIcon = <FontAwesomeIcon icon={faExclamationTriangle} />;
const retryIcon = <FontAwesomeIcon icon={faRedoAlt} />;
const cancelIcon = <FontAwesomeIcon icon={faTimes} />;
const upIcon = <FontAwesomeIcon icon={faAngleUp} />;
const downIcon = <FontAwesomeIcon icon={faAngleDown} />;
//Other Constants
const uploadUrl = serverUrls.POST.uploadUrl;
const uploadField = serverFields.uploadField;
const successClearTime = 200;
export default class FileUploadDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploads: [],
      errorCount: 0,
      isMinimized: false,
      fadeOnClear: false,
    };
  }
  retryUpload(upload) {
    const file = upload.file;
    this.removeUpload(upload, () => {
      let toUpload = this.state.uploads;
      toUpload.push(this.createUpload(file));
      this.setState({ uploads: toUpload });
    });
  }
  clearUpload(upload) {
    if (upload.status !== null) this.removeUpload(upload);
    else {
      //toast.info(`Canceled ${upload.file.name}`);
      upload.cancelUpload();
    }
  }
  retryAll() {
    let uploads = this.state.uploads;
    //Splicing so itterate backwards
    //(retryUpload is what calls the splice via removeUpload)
    for (var i = uploads.length - 1; i >= 0; i--) {
      if (uploads[i].status === "Error") {
        this.retryUpload(uploads[i]);
      }
    }
    this.setState({ errorCount: 0 });
  }
  clearAll() {
    let uploads = this.state.uploads;
    let onlyPending = true;
    for (var i = uploads.length - 1; i >= 0; i--) {
      if (uploads[i].status !== null) {
        uploads.splice(i, 1);
        onlyPending = false;
      }
    }
    //If onlypending cancel all uploads currently remaining
    if (onlyPending) {
      uploads.forEach((upload) => {
        upload.cancelUpload();
      });
      //toast.info("Canceled All Uploads");
    }

    this.setState({ uploads, errorCount: 0 });
  }

  removeUpload(upload, cb) {
    if (!upload) return;
    //Remove error count if the upload errored because we're now removing it
    let errorCount = this.state.errorCount;
    let fadeOnClear = this.state.fadeOnClear;
    if (upload.status === "Error") errorCount--;
    //Update and remove the uploads
    let uploads = this.state.uploads;
    uploads.splice(uploads.indexOf(upload), 1);
    if (uploads.length === 0) fadeOnClear = true;
    this.setState({ uploads, errorCount, fadeOnClear }, cb);
  }
  handleSelected = (e) => {
    let toUpload = this.state.uploads;
    [...e.target.files].forEach((file, index) => {
      toUpload.push(this.createUpload(file));
    });
    this.setState({ uploads: toUpload });
  };
  getUploadById(id) {
    let upload;
    for (const u of this.state.uploads) {
      if (u.id === id) {
        upload = u;
        break;
      }
    }
    return upload;
  }
  createUpload(file) {
    this.setState({ fadeOnClear: true });
    const appendTime = Date.now();
    let uploadObj = {
      file,
      id: appendTime + file.name,
      progress: 0,
      status: null,
    };
    const cancelToken = new CancelToken(function (cancel) {
      uploadObj.cancelUpload = () => cancel("User Canceled");
    });

    const data = new FormData();
    data.append(uploadField, file);
    axios
      .post(uploadUrl, data, {
        headers: {
          //Send data to server to prevent the server from uploading the entire file first
          filesize: file.size,
        },
        onUploadProgress: (e) => this.uploadProgress(e, uploadObj.id),
        cancelToken,
      })
      .then((res) => {
        this.uploadDone(res, uploadObj.id);
      })
      .catch((e) => {
        if (e.response == null) {
          toast.error("Unknown Error Occured!");
          console.log(e);
        } else if (e.response.status === 401) toast.error("Not Logged In!");
        else if (e.response.status === 500) toast.error("Drive Full!");
        this.showError(uploadObj.id);
      });

    return uploadObj;
  }
  uploadProgress(e, id) {
    const totalLength = e.lengthComputable
      ? e.total
      : e.target.getResponseHeader("content-length") ||
        e.target.getResponseHeader("x-decompressed-content-length");
    if (totalLength !== null) {
      const loaded = Math.round((e.loaded * 100) / totalLength);
      let uploads = this.state.uploads;
      let upload = this.getUploadById(id);
      const uploadIndex = uploads.indexOf(upload);
      upload.progress = loaded;
      uploads[uploadIndex] = upload;
      this.setState({ uploads });
    }
  }
  uploadDone(res, uploadId) {
    let uploads = this.state.uploads;
    let upload = this.getUploadById(uploadId);
    const uploadIndex = uploads.indexOf(upload);
    delete upload.cancelUpload;
    uploads[uploadIndex] = upload;
    this.setState({ uploads });
    if (res.status === 200) {
      this.showSuccess(uploadId, res.data);
    } else if (res.data.message) {
      this.showError(uploadId);
    } else {
      toast.error("HTTP CODE Internal Server Error");
    }
  }

  updateStatus(id, status) {
    let uploads = this.state.uploads;
    let upload = this.getUploadById(id);
    const uploadIndex = uploads.indexOf(upload);
    upload.status = status;
    uploads[uploadIndex] = upload;
    this.setState({ uploads });
  }
  showError(id) {
    this.updateStatus(id, "Error");
    this.setState({ errorCount: this.state.errorCount + 1 });
  }
  showSuccess(id, file) {
    const completedUpload = this.getUploadById(id);
    this.props.addFilebox(file);
    this.updateStatus(id, "Success");
    setTimeout(() => this.removeUpload(completedUpload), successClearTime);
  }

  fudDisplay() {
    let className = "fud";
    if (this.state.fadeOnClear && this.state.uploads.length === 0) {
      return (className += " fud-fade");
    }
    if (this.state.isMinimized) return (className += " fud-minimized");
    if (this.state.uploads.length > 0) {
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
          onChange={this.handleSelected}
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
          {this.state.uploads.map(
            (upload, index) =>
              upload && (
                <FileWatcher
                  file={upload.file}
                  key={index + upload.file.name}
                  retryUpload={() => this.retryUpload(upload)}
                  clearUpload={() => this.clearUpload(upload)}
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
