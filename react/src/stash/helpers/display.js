//constants
const successClearTime = 200;
//Methods
function uploadProgress(e, uploadUuid) {
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
function uploadDone(res, uploadUuid) {
  var file = res.data;
  var uploads = this.state.uploads;
  delete uploads[uploadUuid].cancelUpload;
  this.setState({ uploads });
  this.showSuccess(uploadUuid);
  this.props.addFilebox(file);
}
function showError(uploadUuid) {
  var uploads = this.state.uploads;
  uploads[uploadUuid].status = "Error";
  this.setState({ uploads, errorCount: this.state.errorCount + 1 });
}
function showSuccess(uploadUuid) {
  var uploads = this.state.uploads;
  uploads[uploadUuid].status = "Success";
  this.setState({ uploads });
  setTimeout(() => this.removeUpload(uploadUuid), successClearTime);
}
function removeUpload(uploadUuid) {
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
//Export
const displayExports = {
  uploadProgress,
  uploadDone,
  showError,
  showSuccess,
  removeUpload,
};
export default displayExports;
