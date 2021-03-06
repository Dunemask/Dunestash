const uploadUrl = "upload";
//Dropzone
const fileDropzone = document.getElementById("file-dropzone");
const dropArea = document.getElementById("file-drop-area");
//Add Event Listeners
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});
fileDropzone.addEventListener("change", () => handleFiles(fileDropzone.files));
dropArea.addEventListener("drop", handleDrop, false);
function highlight(e) {
  dropArea.classList.add("highlight");
}
function unhighlight(e) {
  dropArea.classList.remove("highlight");
}
function handleDrop(e) {
  handleFiles(e.dataTransfer.files);
}
function handleFiles(files) {
  const loadedFiles = [...files];
  updateFileDialog();
  loadedFiles.forEach(fileWatcherUpload);
}
//End Dropzone

//File Dialog
const fileUploadDialog = document.getElementById("file-upload-dialog");
const fileUploadDialogStatus = document.getElementById(
  "file-upload-dialog-header-status"
);
const fileUploadDialogStatusIcon = document.getElementById(
  "file-upload-dialog-status-icon"
);
const selectedFiles = document.getElementById("selected-files");
const uploadErrorDialogCount = document.getElementById(
  "file-upload-dialog-error-count"
);


function changeErrorValue(errorChange) {
  let errorValue = parseInt(uploadErrorDialogCount.innerHTML);
  errorValue = isNaN(errorValue) ? 0 : errorValue;
  errorValue += errorChange;
  uploadErrorDialogCount.innerHTML = errorValue;
  return errorValue;
}
function hideFileDialog() {
  if (selectedFiles.childElementCount == 0) {
    fileUploadDialog.classList.add("file-watcher-success");
    setTimeout(() => {
      fileUploadDialog.style.height = 0;
    }, 700);
  }
}
function updateFileDialog() {
  let errorValue = parseInt(uploadErrorDialogCount.innerHTML);
  const uploadIcon = fileUploadDialogStatusIcon.querySelector(
    ".file-upload-dialog-success-icon"
  );
  const errorWrapper = fileUploadDialogStatusIcon.querySelector(
    ".file-upload-dialog-error-wrapper"
  );
  const errorIcon = fileUploadDialogStatusIcon.querySelector(
    ".file-upload-dialog-error-icon"
  );
  if (errorValue == 0 || isNaN(errorValue)) {
    uploadErrorDialogCount.innerHTML = "";
    uploadIcon.style.display = "flex";
    errorIcon.style.display = "none";
    errorWrapper.style.display = "none";
    fileUploadDialogStatus.style.background = "";
  } else if (errorValue > 0) {
    uploadErrorDialogCount.innerHTML = isNaN(errorValue) ? "" : errorValue;
    uploadIcon.style.display = "none";
    errorIcon.style.display = "flex";
    errorWrapper.style.display = "flex";
    fileUploadDialogStatusIcon.classList.add("file-upload-dialog-status-error");
  }
}
function showFileDialog() {
  fileUploadDialog.classList.remove("file-watcher-success");
  fileUploadDialog.style.height = "100%";
  fileUploadDialog.style.display = "block";
}
//Progressbars
const WatcherAction = {
  Cancel: "Cancel",
  Clear: "Clear",
  Retry: "Retry",
};
//Watcher Actions
function watcherActionCancel(e) {
  const target = e.target || e.srcElement;
  const fileWatcher = target.closest(".file-watcher");
  fileWatcher.selectedXhr.abort();
}
function watcherActionRetry(e) {
  const target = e.target || e.srcElement;
  const fileWatcher = target.closest(".file-watcher");
  const parent = target.closest(".file-watcher");
  changeErrorValue(-1);
  selectedFiles.removeChild(parent);
  fileWatcherUpload(fileWatcher.selectedFile);
  updateFileDialog();
}
function watcherActionClear(e) {
  changeErrorValue(-1);
  updateFileDialog();
  const target = e.target || e.srcElement;
  const parent = target.closest(".file-watcher");
  selectedFiles.removeChild(parent);
  hideFileDialog();
}
function createWatcherAction(type) {
  const watcherAction = document.createElement("span");
  watcherAction.classList.add("file-watcher-action");
  const watcherActionIcon = document.createElement("i");
  watcherActionIcon.classList.add("fas");
  switch (type) {
    case WatcherAction.Cancel:
      watcherActionIcon.classList.add("fa-times");
      watcherAction.addEventListener("click", watcherActionCancel);
      break;
    case WatcherAction.Clear:
      watcherActionIcon.classList.add("fa-times");
      watcherAction.addEventListener("click", watcherActionClear);
      break;
    case WatcherAction.Retry:
      watcherActionIcon.classList.add("fa-redo-alt");
      watcherAction.addEventListener("click", watcherActionRetry);
      break;
  }
  watcherActionIcon.classList.add("file-watcher-action-icon");
  watcherAction.append(watcherActionIcon);
  return watcherAction;
}
//End Watcher Actions
function createFileWatcher(xhr, file) {
  //Create Elements
  const watcher = document.createElement("div");
  const progressBar = document.createElement("div");
  const progressBarFill = document.createElement("div");
  const progressBarText = document.createElement("span");
  const fileNameWrapper = document.createElement("div");
  const fileName = document.createElement("span");
  const action = createWatcherAction(WatcherAction.Cancel);
  watcher.classList.add("file-watcher", "file-watcher-active");
  progressBar.classList.add("file-watcher-progressbar");
  progressBarFill.classList.add("file-watcher-progressbar-fill");
  progressBarText.classList.add("file-watcher-progressbar-text");
  fileNameWrapper.classList.add("file-watcher-name-wrapper");
  fileName.classList.add("file-watcher-name");
  fileName.innerHTML = file.name;
  progressBarFill.append(progressBarText);
  progressBar.append(progressBarFill);
  watcher.append(progressBar);
  watcher.append(fileName);
  watcher.append(action);
  watcher.selectedFile = file;
  watcher.selectedXhr = xhr;
  return watcher;
}
function initiliazeFileWatcher(xhr, file) {
  const fileWatcher = createFileWatcher(xhr, file);
  xhr.upload.addEventListener("progress", (e) => {
    xhrProgress(e, fileWatcher);
  });
  xhr.upload.addEventListener("load", () => {
    xhrLoad(fileWatcher);
  });
  xhr.upload.addEventListener("error", () => {
    xhrError(fileWatcher);
  });
  xhr.upload.addEventListener("timeout", () => {
    xhrTimeout(fileWatcher);
  });
  xhr.upload.addEventListener("abort", () => {
    xhrTimeout(fileWatcher);
  });
  //selectedFiles.insertBefore(fileWatcher,selectedFiles.children[0]);
  selectedFiles.append(fileWatcher);
  return fileWatcher;
}
function fileWatcherFade(fileWatcher) {
  //Change File Action
  fileWatcher.classList.add("file-watcher-success");
  setTimeout(function () {
    selectedFiles.removeChild(fileWatcher);
    updateFileDialog();
    hideFileDialog();
  }, 700);
}
//End Progressbars
//Upload Listeners
function xhrProgress(e, fileWatcher) {
  const progressBarFill = fileWatcher.querySelector(
    ".file-watcher-progressbar-fill"
  );
  const progressBarText = progressBarFill.querySelector(
    ".file-watcher-progressbar-text"
  );
  const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0.0;
  progressBarFill.style.width = progressBarFill.style.width =
    percent.toFixed(2) + "%";
  progressBarText.innerHTML = percent.toFixed(0) + "%";
}
function xhrLoadstart(fileWatcher) {
  const progressBar = fileWatcher.querySelector(".file-watcher-progressbar");
  progressBar.style.display = "block";
}
function xhrLoad(fileWatcher) {
  const progressBarFill = fileWatcher.querySelector(
    ".file-watcher-progressbar-fill"
  );
  const progressBarText = fileWatcher.querySelector(
    ".file-watcher-progressbar-text"
  );
  progressBarFill.style.width = "100%";
  const checkmark = document.createElement("i");
  checkmark.classList.add("fas", "fa-check");
  progressBarText.innerHTML = "";
  progressBarText.style.margin = "auto";
  progressBarText.append(checkmark);
}
function xhrError(fileWatcher) {
  const progressBarFill = fileWatcher.querySelector(
    ".file-watcher-progressbar-fill"
  );
  const progressBarText = fileWatcher.querySelector(
    ".file-watcher-progressbar-text"
  );
  //Error Already Happened
  if (progressBarFill.classList.contains("file-watcher-progressbar-fill-error"))
    return;
  //Set Error
  progressBarFill.classList.add("file-watcher-progressbar-fill-error");
  progressBarFill.style.width = "100%";
  //Create Icon
  const icon = document.createElement("i");
  icon.classList.add("fas", "fa-exclamation-triangle");
  progressBarText.innerHTML = "";
  progressBarText.style.margin = "auto";
  progressBarText.append(icon);
  //Remove Current Action
  fileWatcher
    .querySelectorAll(".file-watcher-action")
    .forEach((n) => n.remove());
  fileWatcher.classList.remove("file-watcher-active");
  const retryAction = createWatcherAction(WatcherAction.Retry);
  const clearAction = createWatcherAction(WatcherAction.Clear);
  fileWatcher.append(retryAction);
  fileWatcher.append(clearAction);
  retryAction.style.width = "25px";
  clearAction.style.width = "25px";
  selectedFiles.append(selectedFiles.removeChild(fileWatcher));
  //File Upload Dialog Update
  changeErrorValue(1);
  updateFileDialog();
}
function xhrTimeout(fileWatcher) {
  xhrError(fileWatcher);
}
function xhrAbort(fileWatcher) {
  xhrError(fileWatcher);
}
//End Upload Listeners
//Handle Upload
function fileWatcherUpload(file) {
  let formData = new FormData();
  formData.append("user-selected-file", file);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", uploadUrl, true);
  xhr.setRequestHeader("filesize", file.size);
  const fileWatcher = initiliazeFileWatcher(xhr, file);
  showFileDialog();
  //
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      handleResponse(xhr.response, fileWatcher);
    }
  };
  xhr.send(formData);
}
//Server Responses
function handleResponse(response, fileWatcher) {
  //Response is in json mode
  let localStatus = {};
  if (response == "") {
    xhrError(fileWatcher);
  } else {
    const res = JSON.parse(response);
    if (!!res.status && !!res.status.type && res.status.type == "Error") {
      xhrError(fileWatcher);
    } else if (
      !!res.status &&
      !!res.status.type &&
      res.status.type == "Success"
    ) {
      fileWatcherFade(fileWatcher);
      console.log(res);
    } else {
      console.log("Unkown Response");
    }
  }
}

/*selectedFiles.append(initiliazeFileWatcher(undefined,{name:"Test File"}));
selectedFiles.append(initiliazeFileWatcher(undefined,{name:"Test File"}));
selectedFiles.append(initiliazeFileWatcher(undefined,{name:"Test File"}));*/
