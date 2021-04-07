const userFilesUrl = "my-files-list";
const ownedList = document.getElementById("owned-files");
const fileDropArea = document.getElementById("file-drop-area");
//Generic Methods
function easyDate(date) {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())) {
    return "";
  } else {
    return `${
      d.getMonth() + 1
    }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
}
function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
function filePrettyify(serverFile) {
  let file = { ...serverFile };
  const path = serverFile.path;
  const date = path.substring(0, path.indexOf("-"));
  const name = path.substring(path.indexOf("-") + 1);
  file.name = name;
  file.date = date;
  return file;
}
//File Drive
class DriveSelector {
  constructor(fileList) {
    this.selectedBoxes = [];
    this.fileBoxes = [];
    this.fileList = fileList;
    this.firstSelection;
    this.optionPanel = new OptionPane(this);
  }
  addFilebox(fileBox) {
    fileBox.box.addEventListener("click", (e) => this.boxClick(e, fileBox));
    this.fileBoxes.push(fileBox);
    this.fileList.append(fileBox.box);
  }
  removeFilebox(fileBox) {
    this.fileList.removeChild(fileBox.box);
    this.fileBoxes.splice(this.fileBoxes.indexOf(fileBox), 1);
  }
  removeAllBoxes() {
    this.fileBoxes.forEach((fileBox) => {
      this.fileList.removeChild(fileBox.box);
    });
    this.selectedBoxes = [];
    this.fileBoxes = [];
  }
  boxClick(e, fileBox) {
    const isTouch = isTouchDevice();
    const optionsClick = e.target.closest(".file-options");
    const insideOptionsClick = optionsClick && optionsClick.contains(e.target);
    const hasPanel = fileBox.box.contains(this.optionPanel.pane);
    let highlighted = fileBox.isHighlighted();
    //Handle Selection
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(fileBox);
    } else if (
      //Run on touch, and clicking an unhighlighted w/o options OR
      //A highlighted non options
      ((isTouch && (!insideOptionsClick || !highlighted)) || e.ctrlKey) &&
      this.firstSelection
    ) {
      this.additionalSelection(fileBox);
    } else if (!highlighted || (!optionsClick && this.firstSelection)) {
      this.singleSelection(fileBox);
    }
    //Get new selection for displaying the Options Pane
    highlighted = fileBox.isHighlighted();
    //Toggle Panel Visibility/Location
    if (!optionsClick || !highlighted) {
      this.removeOptionsPane();
    } else if (optionsClick && highlighted && hasPanel) {
      this.toggleOptionsPane(fileBox);
    } else if (optionsClick && highlighted && !hasPanel) {
      this.removeOptionsPane(); //Another Box Clicked
      this.addOptionsPane(fileBox);
    }
    //Adjust Menu for selected count
    this.optionPanel.updateView();
  }
  singleSelection(fileBox) {
    this.clearAllSelection();
    fileBox.highlight();
    this.firstSelection = fileBox;
    this.selectedBoxes = [fileBox];
  }
  multiSelection(fileBox) {
    //The end index always needs to be increased by one
    let startIndex = this.fileBoxes.indexOf(this.firstSelection);
    let endIndex = this.fileBoxes.indexOf(fileBox) + 1;
    if (startIndex >= endIndex) {
      let tmpIndex = endIndex;
      endIndex = startIndex + 1; //Flipperflopper to include missing elements
      startIndex = tmpIndex - 1;
    }
    this.clearAllSelection();
    this.fileBoxes.slice(startIndex, endIndex).forEach((fileBox, i) => {
      fileBox.highlight();
      this.selectedBoxes.push(fileBox);
    });
  }
  additionalSelection(fileBox) {
    const fileBoxIndex = this.selectedBoxes.indexOf(fileBox);
    fileBox.toggleHighlight();
    if (fileBoxIndex != -1) {
      this.selectedBoxes.splice(fileBoxIndex, 1);
    } else {
      this.selectedBoxes.push(fileBox);
    }
  }
  clearAllSelection() {
    this.selectedBoxes.forEach((fileBox) => {
      fileBox.unhighlight();
    });
    this.selectedBoxes = [];
  }
  optionsPaneVisible() {
    return this.optionPanel.pane.parentNode != null;
  }
  toggleOptionsPane(fileBox) {
    if (this.optionsPaneVisible()) {
      this.removeOptionsPane();
    } else {
      this.addOptionsPane(fileBox);
    }
  }
  addOptionsPane(fileBox) {
    fileBox.box.append(this.optionPanel.pane);
  }
  removeOptionsPane() {
    if (this.optionsPaneVisible())
      this.optionPanel.pane.parentNode.removeChild(this.optionPanel.pane);
  }
}
class OptionPane {
  constructor(driveSelector) {
    this.driveSelector = driveSelector;
    const optionPane = document.createElement("div");
    const paneList = document.createElement("ul");
    const viewOption = document.createElement("li");
    const downloadOption = document.createElement("li");
    const deleteOption = document.createElement("li");
    const publicOption = document.createElement("li");
    const shareOption = document.createElement("li");
    //Fa Icons
    const viewIcon = document.createElement("i");
    const downloadIcon = document.createElement("i");
    const deleteIcon = document.createElement("i");
    const publicIcon = document.createElement("i");
    const shareIcon = document.createElement("i");
    //Add action ClassLists
    viewOption.classList.add("view-option");
    downloadOption.classList.add("download-option");
    deleteOption.classList.add("delete-option");
    publicOption.classList.add("public-option");
    shareOption.classList.add("share-option");
    //Icon Classlists
    viewIcon.classList.add("fas", "fa-info-circle");
    downloadIcon.classList.add("fas", "fa-file-download");
    deleteIcon.classList.add("fas", "fa-trash");
    publicIcon.classList.add("fas", "fa-eye");
    shareIcon.classList.add("fas", "fa-share-square");
    //Add onclicks
    viewOption.onclick = () => viewFile(driveSelector);
    downloadOption.onclick = () => downloadFile(driveSelector);
    deleteOption.onclick = () => deleteFile(driveSelector);
    publicOption.onclick = () => togglePublicFile(driveSelector);
    shareOption.onclick = () => shareFile(driveSelector);
    //Add Fa Icons
    viewOption.append(viewIcon);
    downloadOption.append(downloadIcon);
    deleteOption.append(deleteIcon);
    publicOption.append(publicIcon);
    shareOption.append(shareIcon);
    //Add names for interactive actions
    viewOption.innerHTML += "View";
    downloadOption.innerHTML += "Download";
    deleteOption.innerHTML += "Delete";
    publicOption.innerHTML += "Public";
    shareOption.innerHTML += "Share";
    //Append Children
    optionPane.classList.add("file-option-pane");
    paneList.append(viewOption);
    paneList.append(downloadOption);
    paneList.append(publicOption);
    paneList.append(shareOption);
    paneList.append(deleteOption);
    optionPane.append(paneList);
    this.pane = optionPane;
  }

  updateView() {
    const topElement = this.pane.querySelector("ul").childNodes[0];
    if (this.driveSelector.selectedBoxes.length <= 1) this.hideMultiView();
    else this.showMultiView();
  }
  hideMultiView() {
    const topElement = this.pane.querySelector("ul").childNodes[0];
    topElement.innerHTML = topElement.innerHTML.replace(
      topElement.innerText,
      ""
    );
    topElement.innerHTML += "View";
  }
  showMultiView() {
    const topElement = this.pane.querySelector("ul").childNodes[0];
    topElement.innerHTML = topElement.innerHTML.replace(
      topElement.innerText,
      ""
    );
    topElement.innerHTML += `${this.driveSelector.selectedBoxes.length} Files Selected`;
  }
}
class FileBox {
  constructor(file) {
    this.file = file;
    this.selected = false;
    this.optionPane = new OptionPane(file);
    this.box = this.buildBox();
    //  this.box.append(this.optionPane.pane);
  }
  buildBox() {
    const fileBox = document.createElement("div");
    const fileContents = document.createElement("div");
    const fileInfo = document.createElement("div");
    const fileName = document.createElement("span");
    const fileDate = document.createElement("span");
    const fileOptions = document.createElement("span");
    const fileEllipsis = document.createElement("i");
    //Setup classList;
    fileBox.classList.add("file");
    fileContents.classList.add("file-contents");
    fileInfo.classList.add("file-info");
    fileName.classList.add("file-name");
    fileName.classList.add("file-date");
    fileOptions.classList.add("file-options");
    fileEllipsis.classList.add("fas", "fa-ellipsis-v");
    fileName.innerHTML = this.file.name;
    fileDate.innerHTML = easyDate(this.file.date);
    //Append/Build box
    fileOptions.append(fileEllipsis);
    fileInfo.append(fileName);
    fileInfo.append(fileDate);
    fileContents.append(fileInfo);
    fileContents.append(fileOptions);
    fileBox.append(fileContents);
    return fileBox;
  }
  isHighlighted() {
    return this.box
      .querySelector(".file-contents")
      .classList.contains("highlight");
  }
  highlight() {
    this.box.querySelector(".file-contents").classList.add("highlight");
  }
  unhighlight() {
    this.box.querySelector(".file-contents").classList.remove("highlight");
  }
  toggleHighlight() {
    if (this.isHighlighted()) {
      this.unhighlight();
    } else {
      this.highlight();
    }
  }
}
class ProcessIndicator {
  constructor(indicator) {
    this.processingIndicator = indicator;
    this.processCount = 0;
    this.counter = this.processingIndicator.querySelector("span");
  }
  removeProcess() {
    this.processCount--;
    if (this.processCount <= 0) {
      this.hide();
    }
    this.updateCount();
  }
  addProcess() {
    this.processCount++;
    if (this.processCount >= 1) {
      this.show();
    }
    this.updateCount();
  }
  updateCount() {
    if (this.processCount > 1) {
      this.counter.innerText = this.processCount;
    } else {
      this.counter.innerText = "";
    }
  }
  show() {
    this.processingIndicator.classList.add("active");
  }
  hide() {
    this.processingIndicator.classList.remove("active");
  }
}
const driveSelector = new DriveSelector(ownedList);
const processIndicator = new ProcessIndicator(
  document.querySelector(".processing-indicator")
);
//Actions
function viewFile(driveSelector) {
  const selectedBoxes = driveSelector.selectedBoxes;
  if (selectedBoxes.length == 1) {
    let win = window.open(`/rawdata?target=${selectedBoxes[0].file.uuid}`);
    if (!win || win.closed || typeof win.closed == "undefined") {
      window.location = `/rawdata?target=${fileBoxes[0].file.uuid}`;
    }
  }
}
function downloadFile(driveSelector) {
  const selectedBoxes = driveSelector.selectedBoxes;
  const url = "download";
  let files = [];
  let xhr = new XMLHttpRequest();
  selectedBoxes.forEach((fileBox) => {
    files.push(fileBox.file.uuid);
  });
  //Send XHR request

  xhr.open("POST", url);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      processIndicator.removeProcess();
      const res = JSON.parse(xhr.response);
      if (res.status) {
        console.log("THERE WAS AN ERROR");
      } else if (res.downloadUrl) {
        const openLink = document.createElement("a");
        openLink.href = res.downloadUrl;
        openLink.download = true;
        openLink.click();
      }
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(files));
  processIndicator.addProcess();
}
function deleteFile(driveSelector) {
  const selectedBoxes = driveSelector.selectedBoxes;
  const url = "delete";
  let files = [];
  let xhr = new XMLHttpRequest();
  selectedBoxes.forEach((fileBox) => {
    files.push(fileBox.file.uuid);
  });
  const staticSelectedBoxes = [...driveSelector.selectedBoxes];
  //Send XHR request
  xhr.open("POST", url);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      processIndicator.removeProcess();
      const res = JSON.parse(xhr.response);
      if (res.status) {
        if (res.status.type == "Error") console.log("Error Deleting File");
        new Toaster().defaultToast(res.status.tag, res.status.type);
      }
      //Reusing files variable
      files = res.failedFiles || [];
      staticSelectedBoxes.forEach((fileBox) => {
        if (!files.includes(fileBox.file.uuid))
          driveSelector.removeFilebox(fileBox);
      });
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(files));
  processIndicator.addProcess();
}
function shareFile(driveSelector) {
  const selectedBoxes = driveSelector.selectedBoxes;
  const url = "share";
  let files = [];
  //  let xhr = new XMLHttpRequest();
  selectedBoxes.forEach((fileBox) => {
    files.push(fileBox.file.uuid);
  });

  console.log("Would share files:");
  console.log(files);
}
function togglePublicFile(driveSelector) {
  const selectedBoxes = driveSelector.selectedBoxes;
  const url = "public";
  let files = [];
  //  let xhr = new XMLHttpRequest();
  selectedBoxes.forEach((fileBox) => {
    files.push(fileBox.file.uuid);
  });

  console.log("Would make these files public:");
  console.log(files);
}
function updateUserFiles(cb) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", userFilesUrl);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (typeof xhr.response === "string") {
        let files = [];
        let serverFiles = JSON.parse(xhr.response);
        serverFiles.forEach((serverFile) => {
          files.push(filePrettyify(serverFile));
        });
        cb(files);
      }
    }
  };
  xhr.send();
}
//Actions
fileDropArea.addEventListener("click", (e) => {
  const fileListParent = e.target.closest(".files");
  const fileParent = e.target.closest(".file");
  if (!fileListParent || !fileParent) {
    driveSelector.clearAllSelection();
    driveSelector.removeOptionsPane();
  }
});

const reloadFiles = (driveSelector) => {
  driveSelector.removeAllBoxes();
  loadFiles();
};
const loadFiles = () => {
  updateUserFiles(function (files) {
    files.forEach((file) => {
      driveSelector.addFilebox(new FileBox(file));
    });
  });
};
loadFiles();
