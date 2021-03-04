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
  selectedFiles.append(fileWatcher);
  return fileWatcher;
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
  progressBarFill.style.width = percent.toFixed(0) + "%";
  progressBarText.innerHTML = percent.toFixed(0) + "%";
}
function xhrLoadstart(fileWatcher) {
  const progressBar = fileWatcher.querySelector(".file-watcher-progressbar");
  progressBar.style.display = "block";
}
function xhrLoad(fileWatcher) {
  const progressBarText = fileWatcher.querySelector(
    ".file-watcher-progressbar-text"
  );
  const checkmark = document.createElement("i");
  checkmark.classList.add("fas", "fa-check");
  progressBarText.innerHTML = "";
  progressBarText.style.margin = "auto";
  progressBarText.append(checkmark);
  //Change File Action
  fileWatcher
    .querySelectorAll(".file-watcher-action")
    .forEach((n) => n.remove());
  fileWatcher.classList.remove("file-watcher-active");
  fileWatcher.append(createWatcherAction(WatcherAction.Clear));
}
function xhrError(fileWatcher) {
  const progressBarFill = fileWatcher.querySelector(
    ".file-watcher-progressbar-fill"
  );
  const progressBarText = fileWatcher.querySelector(
    ".file-watcher-progressbar-text"
  );
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
    console.log(res);
    if (!!res.status && !!res.status.type && res.status.type == "Error") {
      xhrError(fileWatcher);
    } else if(!!res.status && !!res.status.type && res.status.type == "Success"){
      console.log("Upload Successful");
    }else{
      console.log("Unkown Response");
    }
  }

}
