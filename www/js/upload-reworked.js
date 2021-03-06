const uploadUrl = "upload";
const WatcherActions = {
  Cancel: "Cancel",
  Clear: "Clear",
  Retry: "Retry",
};
//Constants
const fud = document.getElementById("fud");
const fudStatusIcon = document.getElementById("fud-status-icon");
const queuedFiles = document.getElementById("fud-queued-files");
const fudErrorCount = document.getElementById("fud-error-count");
const fudStatusRetry = document.getElementById("fud-retry");
const fudStatusClear = document.getElementById("fud-clear");
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
//Upload Classes
class FileQueue {
  constructor() {
    this.watchers = [];
  }
  addWatcher(fileWatcher) {
    this.watchers.push(fileWatcher);
    queuedFiles.append(fileWatcher);
  }
  removeWatcher(fileWatcher) {
    changeErrorValue(-1);
    //this.fileWatchers.splice(this.watchers.indexOf(fileWatcher),1);
    queuedFiles.removeChild(fileWatcher);
    updateFileDialog();
    hideFileDialog();
  }
  retry(fileWatcher) {
    changeErrorValue(-1);
    queuedFiles.removeChild(fileWatcher);
    fileWatcherUpload(fileWatcher.file);
  }
  cancel(fileWatcher) {
    fileWatcher.xhr.abort();
  }
  clear(fileWatcher) {
    this.removeWatcher(fileWatcher);
  }
  updateError(count) {
    changeErrorValue(count);
    updateFileDialog();
  }
}
class FileWatcher {
  constructor(xhr, file) {
    this.watcher = document.createElement("div");
    this.watcher.xhr = xhr;
    this.watcher.file = file;
    this.setup();
    this.addListeners();
  }
  setup() {
    const progressBar = document.createElement("div");
    const progressBarFill = document.createElement("div");
    const progressBarText = document.createElement("span");
    const fileNameWrapper = document.createElement("div");
    const fileName = document.createElement("span");
    const action = this.createWatcherAction(WatcherActions.Cancel);
    this.watcher.classList.add("file-watcher", "file-watcher-active");
    progressBar.classList.add("file-watcher-progressbar");
    progressBarFill.classList.add("file-watcher-progressbar-fill");
    progressBarText.classList.add("file-watcher-progressbar-text");
    fileNameWrapper.classList.add("file-watcher-name-wrapper");
    fileName.classList.add("file-watcher-name");
    fileName.innerHTML = this.watcher.file.name;
    progressBarFill.append(progressBarText);
    progressBar.append(progressBarFill);
    this.watcher.append(progressBar);
    this.watcher.append(fileName);
    this.watcher.append(action);
  }
  addListeners() {
    this.watcher.xhr.upload.addEventListener("progress", (e) =>
      this.xhrProgress(e)
    );
    this.watcher.xhr.upload.addEventListener("load", () => this.xhrLoad());
    this.watcher.xhr.upload.addEventListener("error", () => this.xhrError());
    this.watcher.xhr.upload.addEventListener("timeout", () =>
      this.xhrTimeout()
    );
    this.watcher.xhr.upload.addEventListener("abort", () => this.xhrAbort());
  }
  xhrProgress(e) {
    const progressBarFill = this.watcher.querySelector(
      ".file-watcher-progressbar-fill"
    );
    const progressBarText = this.watcher.querySelector(
      ".file-watcher-progressbar-text"
    );
    const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0.0;
    progressBarFill.style.width = progressBarFill.style.width =
      percent.toFixed(2) + "%";
    progressBarText.innerHTML = percent.toFixed(0) + "%";
  }
  xhrLoadstart() {
    const progressBar = this.watcher.querySelector(".file-watcher-progressbar");
    progressBar.style.display = "block";
  }
  xhrLoad() {
    const progressBarFill = this.watcher.querySelector(
      ".file-watcher-progressbar-fill"
    );
    const progressBarText = this.watcher.querySelector(
      ".file-watcher-progressbar-text"
    );
    progressBarFill.style.width = "100%";
    const checkmark = document.createElement("i");
    checkmark.classList.add("fas", "fa-check");
    progressBarText.innerHTML = "";
    progressBarText.style.margin = "auto";
    progressBarText.append(checkmark);
  }
  xhrError() {
    const progressBarFill = this.watcher.querySelector(
      ".file-watcher-progressbar-fill"
    );
    const progressBarText = this.watcher.querySelector(
      ".file-watcher-progressbar-text"
    );
    //Error Already Happened
    if (
      progressBarFill.classList.contains("file-watcher-progressbar-fill-error")
    )
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
    this.watcher
      .querySelectorAll(".file-watcher-action")
      .forEach((n) => n.remove());
    this.watcher.classList.remove("file-watcher-active");
    const clearAction = this.createWatcherAction(WatcherActions.Clear);
    const retryAction = this.createWatcherAction(WatcherActions.Retry);
    this.watcher.append(retryAction);
    this.watcher.append(clearAction);
    retryAction.style.width = "25px";
    clearAction.style.width = "25px";

    if (queuedFiles.contains(this.watcher))
      return;
    else myQueue.updateError(1);
  }
  xhrTimeout() {
    this.watcher.xhrError();
  }
  xhrAbort() {}
  successClear() {
    this.watcher.classList.add("file-watcher-success");
    setTimeout(() => {
      myQueue.removeWatcher(this.watcher);
    }, 700);
  }
  createWatcherAction(type) {
    const action = document.createElement("span");
    const watcherActionIcon = document.createElement("i");
    action.classList.add("file-watcher-action");
    watcherActionIcon.classList.add("fas");
    switch (type) {
      case WatcherActions.Cancel:
        action.classList.add("file-watcher-action-cancel");
        watcherActionIcon.classList.add("fa-times");
        action.addEventListener("click", () => myQueue.cancel(this.watcher));
        break;
      case WatcherActions.Clear:
        action.classList.add("file-watcher-action-clear");
        watcherActionIcon.classList.add("fa-times");
        action.addEventListener("click", () => myQueue.clear(this.watcher));
        break;
      case WatcherActions.Retry:
        action.classList.add("file-watcher-action-retry");
        watcherActionIcon.classList.add("fa-redo-alt");
        action.addEventListener("click", () => myQueue.retry(this.watcher));
        break;
    }
    watcherActionIcon.classList.add("file-watcher-action-icon");
    action.append(watcherActionIcon);
    return action;
  }
}
//Upload Dialog
const myQueue = new FileQueue();
fudStatusClear.addEventListener("click", (e) => {
  queuedFiles.innerHTML = "";
  fudErrorCount.innerHTML = 0;
  updateFileDialog();
  hideFileDialog();
});
fudStatusRetry.addEventListener("click", (e) => {
  queuedFiles
    .querySelectorAll(".file-watcher-action-retry")
    .forEach((retryAction) => {
      retryAction.click();
    });
});
function fileWatcherUpload(file) {
  let formData = new FormData();
  formData.append("user-selected-file", file);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", uploadUrl, true);
  xhr.setRequestHeader("filesize", file.size);
  const fileWatcher = new FileWatcher(xhr, file);
  showFileDialog();
  myQueue.addWatcher(fileWatcher.watcher);
  //
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      handleResponse(xhr.response, fileWatcher);
    }
  };
  xhr.send(formData);
}
function handleResponse(response, fileWatcher) {
  //Response is in json mode
  let localStatus = {};
  if (response == "") {
    fileWatcher.xhrError();
  } else {
    const res = JSON.parse(response);
    if (!!res.status && !!res.status.type && res.status.type == "Error") {
      fileWatcher.xhrError();
    } else if (
      !!res.status &&
      !!res.status.type &&
      res.status.type == "Success"
    ) {
      fileWatcher.successClear();
      console.log(res);
    } else {
      console.log("Unkown Response");
    }
  }
}
function showFileDialog() {
  fud.classList.remove("file-watcher-success");
  fud.style.height = "100%";
  fud.style.display = "block";
}
function changeErrorValue(errorChange) {
  let errorValue = parseInt(fudErrorCount.innerHTML);
  errorValue = isNaN(errorValue) ? 0 : errorValue;
  errorValue += errorChange;
  fudErrorCount.innerHTML = errorValue;
  return errorValue;
}
function hideFileDialog() {
  if (queuedFiles.childElementCount == 0) {
    fud.classList.add("file-watcher-success");
    setTimeout(() => {
      fud.style.height = 0;
    }, 700);
  }
}
function updateFileDialog() {
  let errorValue = parseInt(fudErrorCount.innerHTML);
  const uploadIcon = fudStatusIcon.querySelector(".fud-success-icon");
  const errorWrapper = fudStatusIcon.querySelector(".fud-error-wrapper");
  const errorIcon = fudStatusIcon.querySelector(".fud-error-icon");
  if (errorValue == 0 || isNaN(errorValue)) {
    fudErrorCount.innerHTML = "";
    uploadIcon.style.display = "flex";
    errorIcon.style.display = "none";
    errorWrapper.style.display = "none";
  } else if (errorValue > 0) {
    fudErrorCount.innerHTML = isNaN(errorValue) ? "" : errorValue;
    uploadIcon.style.display = "none";
    errorIcon.style.display = "flex";
    errorWrapper.style.display = "flex";
    fudStatusIcon.classList.add("fud-status-error");
  }
}
