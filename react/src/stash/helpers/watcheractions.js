function retryUpload(uploadUuid) {
  if (!uploadUuid) return;
  var uploads = this.state.uploads;
  var errorCount = this.state.errorCount;
  const file = uploads[uploadUuid].file;
  //Remove error count if the upload errored because we're now removing it
  if (uploads[uploadUuid].status === "Error") errorCount--;
  //Update and remove the upload
  uploads[uploadUuid] = this.createUpload(file, uploadUuid);
  this.setState({ uploads, errorCount });
}
function clearUpload(uploadUuid) {
  var uploads = this.state.uploads;
  if (uploads[uploadUuid].status !== null) this.removeUpload(uploadUuid);
  else uploads[uploadUuid].cancelUpload();
}
function retryAll() {
  let uploads = this.state.uploads;
  //Splicing so itterate backwards
  //(retryUpload is what calls the splice via removeUpload)
  for (var u in uploads) {
    if (uploads[u].status === "Error") this.retryUpload(u);
  }
}
function clearAll() {
  let uploads = this.state.uploads;
  let onlyPending = true;
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
//Exports
const actionExports = {
  retryUpload,
  clearUpload,
  retryAll,
  clearAll,
};
export default actionExports;
