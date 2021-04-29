//Module Imports
import React from "react";
import axios, { CancelToken } from "axios";
import { toast } from "react-toastify";
//Local Imports
import StashDropzone from "./StashDropzone";
import StashUploadDialog from "./uploader/StashUploadDialog";
//Constants
import { serverUrls, serverFields } from "./api.json";
const uploadUrl = serverUrls.POST.uploadUrl;
const uploadField = serverFields.uploadField;
const cancelMessage = "User Canceled";
const successClearTime = 200;

function buildUpload(file, uploadUuid, onProgress) {
  var authToken = localStorage.getItem("authToken");
  var upload = {
    file,
    uploadUuid,
    progress: 0,
    status: null,
    started: false,
  };
  const cancelToken = new CancelToken((cancel) => {
    upload.cancelUpload = () => cancel(cancelMessage);
  });
  upload.config = {
    headers: { authorization: authToken, filesize: file.size },
    onUploadProgress: (e) => onProgress(e, uploadUuid),
    cancelToken,
  };
  return upload;
}

export default class StashUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploads: {},
      errorCount: 0,
      fadeOnClear: false,
    };
  }

  uploadProgress(e, uploadUuid) {
    const totalLength = e.lengthComputable
      ? e.total
      : e.target.getResponseHeader("content-length") ||
        e.target.getResponseHeader("x-decompressed-content-length");
    if (totalLength !== null) {
      const loaded = Math.round((e.loaded * 100) / totalLength);
      var uploads = this.state.uploads;
      if (loaded === 100 || uploads[uploadUuid] == null) return;
      uploads[uploadUuid].progress = loaded;
      this.setState({ uploads });
    }
  }

  startAllUploads() {
    var uploads = this.state.uploads;
    for (var u in uploads) {
      if (uploads[u].started) continue;
      uploads[u].started = true;
      this.startUpload(uploads[u]);
    }
    this.setState({ uploads });
  }

  startUpload(upload) {
    const data = new FormData();
    data.append(uploadField, upload.file);
    axios
      .post(uploadUrl, data, upload.config)
      .then((res) => this.uploadDone(res, upload))
      .catch((e) => this.uploadError(e, upload));
  }

  uploadDone(res, upload) {
    if (res.status !== 200) return this.showError(upload.uploadUuid);
    var uploads = this.state.uploads;
    delete uploads[upload.uploadUuid].cancelToken;
    this.setState({ uploads });
    this.showSuccess(upload.uploadUuid);
    this.props.addFilebox(res.data);
  }

  uploadError(e, upload) {
    if (e.message === cancelMessage) console.log("Upload Canceled");
    else if (e.response == null) toast.error("Unknown Error Occured!");
    else if (e.response.status === 401) toast.error("Not Logged In!");
    else if (e.response.status === 500) toast.error("Drive Full!");
    this.showError(upload.uploadUuid);
  }

  showError(uploadUuid) {
    var uploads = this.state.uploads;
    uploads[uploadUuid].status = "Error";
    this.setState({ uploads, errorCount: this.state.errorCount + 1 });
  }

  showSuccess(uploadUuid) {
    var uploads = this.state.uploads;
    uploads[uploadUuid].status = "Success";
    this.setState({ uploads });
    setTimeout(() => this.removeUpload(uploadUuid), successClearTime);
  }

  addUpload(files) {
    var uploads = this.state.uploads;
    const uploadTime = Date.now();
    var uploadUuid;
    files.forEach((file, i) => {
      uploadUuid = `${uploadTime}-${i}`;
      uploads[uploadUuid] = buildUpload(
        file,
        uploadUuid,
        this.uploadProgress.bind(this)
      );
    });
    this.setState({ uploads }, this.startAllUploads);
  }

  retryUpload(uploadUuid) {
    if (!uploadUuid) return;
    var uploads = this.state.uploads;
    var errorCount = this.state.errorCount;
    const file = uploads[uploadUuid].file;
    //Remove error count if the upload errored because we're now removing it
    if (uploads[uploadUuid].status === "Error") errorCount--;
    //Update and remove the upload
    this.removeUpload(uploadUuid);
    this.addUpload([file]);
    this.setState({ errorCount });
  }
  clearUpload(uploadUuid) {
    var uploads = this.state.uploads;
    if (uploads[uploadUuid].status !== null) this.removeUpload(uploadUuid);
    else uploads[uploadUuid].cancelUpload();
  }
  clearAll() {
    var uploads = this.state.uploads;
    var onlyPending = true;
    var u;
    for (u in uploads) {
      if (uploads[u].status !== null) {
        delete uploads[u];
        onlyPending = false;
      }
    }
    //If onlypending cancel all uploads currently remaining
    if (onlyPending) for (u in uploads) uploads[u].cancelUpload();
    this.setState({ uploads, errorCount: 0 });
  }
  retryAll() {
    var uploads = this.state.uploads;
    //Splicing so itterate backwards
    //(retryUpload is what calls the splice via removeUpload)
    for (var u in uploads) {
      if (uploads[u].status === "Error") this.retryUpload(u);
    }
  }
  removeUpload(uploadUuid) {
    if (!uploadUuid) return;
    //Remove error count if the upload errored because we're now removing it
    var errorCount = this.state.errorCount;
    var fadeOnClear = this.state.fadeOnClear;
    var uploads = this.state.uploads;
    if (uploads[uploadUuid].status === "Error") errorCount--;
    //Update and remove the upload
    delete uploads[uploadUuid];
    if (Object.keys(uploads).length === 0) fadeOnClear = true;
    this.setState({ uploads, errorCount, fadeOnClear });
  }

  render() {
    return (
      <>
        <StashDropzone
          fileBoxes={this.props.fileBoxes}
          fileBoxesChanged={this.props.fileBoxesChanged}
          addUpload={this.addUpload.bind(this)}
          contextMenu={this.props.contextMenu}
          removeDriveContextMenu={this.props.removeDriveContextMenu}
          getSelectedBoxes={this.props.getSelectedBoxes}
        />
        <StashUploadDialog
          fadeOnClear={this.state.fadeOnClear}
          uploads={this.state.uploads}
          errorCount={this.state.errorCount}
          clearAll={this.clearAll.bind(this)}
          retryAll={this.retryAll.bind(this)}
          clearUpload={this.clearUpload.bind(this)}
          retryUpload={this.retryUpload.bind(this)}
        />
      </>
    );
  }
}
