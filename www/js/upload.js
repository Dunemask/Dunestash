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
selectedFiles.addEventListener("DOMNodeInserted", (e) => {
  if (e.target.parentNode == selectedFiles) {
    updateFileDialog();
  }
});

const StatusIcon = {
  Normal: "Normal",
  Error: "Error",
};
function buildStatusIcon(type) {
  const statusIcon = document.createElement("i");
  statusIcon.classList.add("fas");
  switch (type) {
    case StatusIcon.Normal:
      statusIcon.classList.add("fa-cloud-upload-alt");
      break;
    case StatusIcon.Error:
      statusIcon.classList.add("fa-exclamation-triangle");
      break;
  }
  return statusIcon;
}

function updateFileDialog(errorChange) {
  let errorValue = parseInt(uploadErrorDialogCount.innerHTML);
  if (!isNaN(errorChange)) {
    errorValue = isNaN(errorValue) ? 1 : errorValue + errorChange;
  }
  if (errorValue == 0) {
    uploadErrorDialogCount.innerHTML = "";
    fileUploadDialogStatusIcon.innerHTML = "";
    fileUploadDialogStatusIcon.append(buildStatusIcon(StatusIcon.Normal));
    fileUploadDialogStatus.style.display = "flex";
    if (selectedFiles.childElementCount == 3) {
      fileUploadDialog.classList.add("file-watcher-success");
      setTimeout(() => {
        fileUploadDialog.style.height = 0;
      }, 700);
    }
  } else if (errorChange != undefined) {
    uploadErrorDialogCount.innerHTML = isNaN(errorValue) ? "" : errorValue;
    fileUploadDialogStatusIcon.innerHTML = "";
    fileUploadDialogStatusIcon.append(buildStatusIcon(StatusIcon.Error));
    fileUploadDialogStatus.classList.add("file-upload-dialog-header-error");
    fileUploadDialogStatus.style.display = "grid";
  } else {
    fileUploadDialog.classList.remove("file-watcher-success");
    fileUploadDialog.style.height = "100%";
    fileUploadDialog.style.display = "block";
  }
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
  watcherActionClear(e);
  fileWatcherUpload(fileWatcher.selectedFile);
}
function watcherActionClear(e) {
  const selectedFiles = document.getElementById("selected-files");
  updateFileDialog(-1);
  const target = e.target || e.srcElement;
  const parent = target.closest(".file-watcher");
  selectedFiles.removeChild(parent);
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
  const selectedFiles = document.getElementById("selected-files");
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
  const selectedFiles = document.getElementById("selected-files");
  setTimeout(function () {
    selectedFiles.removeChild(fileWatcher);
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
  //File Upload Dialog Update
  updateFileDialog(1);
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
