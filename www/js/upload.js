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
  loadedFiles.forEach(uploadFile);
}
//End Dropzone
//Progressbars
function watcherActionRetry(e, file) {
  watcherActionClear(e);
  uploadFile(file);
}
function watcherActionClear(e) {
  const selectedFiles = document.getElementById("selected-files");
  const target = e.target || e.srcElement;
  const parent = target.closest(".file-watcher");
  selectedFiles.removeChild(parent);
}
const WatcherAction = {
  Cancel: "Cancel",
  Clear: "Clear",
  Retry: "Retry",
};
function createWatcherAction(type, file, xhr) {
  const watcherAction = document.createElement("span");
  watcherAction.classList.add("file-watcher-action");
  const watcherActionIcon = document.createElement("i");
  watcherActionIcon.classList.add("fas");
  switch (type) {
    case WatcherAction.Cancel:
      watcherActionIcon.classList.add("fa-times");
      watcherAction.addEventListener("click", (e) => {
        xhr.abort();
      });
      break;
    case WatcherAction.Clear:
      watcherActionIcon.classList.add("fa-times");
      watcherAction.addEventListener("click", watcherActionClear);
      break;
    case WatcherAction.Retry:
      watcherActionIcon.classList.add("fa-redo-alt");
      watcherAction.addEventListener("click", (e) => {
        watcherActionRetry(e, file);
      });
      break;
  }
  watcherActionIcon.classList.add("file-watcher-action-icon");
  watcherAction.append(watcherActionIcon);
  return watcherAction;
}
function createFileWatcher(xhr, file) {
  //Create Elements
  const watcher = document.createElement("div");
  const progressBar = document.createElement("div");
  const progressBarFill = document.createElement("div");
  const progressBarText = document.createElement("span");
  const fileNameWrapper = document.createElement("div");
  const fileName = document.createElement("span");
  const action = createWatcherAction(WatcherAction.Cancel, file, xhr);
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
  return watcher;
}
function initiliazeFileWatcher(xhr, file) {
  const selectedFiles = document.getElementById("selected-files");
  const fileWatcher = createFileWatcher(xhr, file);
  const progressBar = fileWatcher.querySelector(".file-watcher-progressbar");
  const progressBarFill = progressBar.querySelector(
    ".file-watcher-progressbar-fill"
  );
  const progressBarText = progressBarFill.querySelector(
    ".file-watcher-progressbar-text"
  );
  console.log("WATCHER TOP");
  console.log(fileWatcher);
  xhr.upload.addEventListener("progress", (e) => {
    xhrProgress(e, progressBarFill, progressBarText);
  });
  xhr.upload.addEventListener("load", () => {
    xhrLoad(progressBarText,fileWatcher);
  });
  xhr.upload.addEventListener("error", () => {
    xhrError(progressBarFill, file);
  });
  xhr.upload.addEventListener("timeout", () => {
    xhrTimeout(progressBarFill, file);
  });
  xhr.upload.addEventListener("abort", () => {
    xhrTimeout(progressBarFill, file);
  });
  selectedFiles.append(fileWatcher);
}
//End Progressbars
//Upload Listeners
function xhrProgress(e, progressBarFill, progressBarText) {
  const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0.0;
  progressBarFill.style.width = percent.toFixed(0) + "%";
  progressBarText.innerHTML = percent.toFixed(0) + "%";
}
function xhrLoadstart(progressBar) {
  progressBar.style.display = "block";
}
function xhrLoad(progressBarText, fileWatcher) {

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
function xhrError(progressBarFill, file) {
  console.log("CALLED ERROR FIRST");
  progressBarFill.classList.add("file-watcher-progressbar-fill-error");
  progressBarFill.style.width = "100%";
  const progressBarText = progressBarFill.querySelector(
    ".file-watcher-progressbar-text"
  );
  const fileWatcher = progressBarFill.closest(".file-watcher");
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
  const retryAction = createWatcherAction(WatcherAction.Retry, file);
  const clearAction = createWatcherAction(WatcherAction.Clear, file);
  fileWatcher.append(retryAction);
  fileWatcher.append(clearAction);
  retryAction.style.width = "25px";
  clearAction.style.width = "25px";
}
function xhrTimeout(progressBarFill, file) {
  xhrError(progressBarFill, file);
}
function xhrAbort(progressBarFill, file) {
  xhrError(progressBarFill, file);
}
//End Upload Listeners
//Handle Upload
function uploadFile(file) {
  let formData = new FormData();
  formData.append("user-selected-file", file);
  const xhr = new XMLHttpRequest();
  xhr.open("POST", uploadUrl, true);
  initiliazeFileWatcher(xhr, file);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      handleResponse(xhr.response, file);
    }
  };
  xhr.send(formData);
}
//Server Responses
function handleResponse(response, file) {
  //Response is in json mode
  let localStatus = {};
  if (response == "") {
    const watchers = document.querySelectorAll(".file-watcher");
    for (var watcher of watchers) {
      if (watcher.selectedFile == file) {
        const progressBarFill = watcher.querySelector(
          ".file-watcher-progressbar-fill"
        );
        if (
          ![...progressBarFill.classList].includes(
            ".file-watcher-progressbar-fill-error"
          )
        ) {
          xhrError(
            watcher.querySelector(".file-watcher-progressbar-fill"),
            file
          );
        } else {
          console.log("Already has");
        }

        break;
      }
    }
  } else {
    const res = JSON.parse(response);
    console.log("UNKOWN RESPONSE");
    console.log(res);
  }
}
