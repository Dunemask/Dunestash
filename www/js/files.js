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
//File Drive
class DriveSelector {
  constructor(fileList) {
    this.selectedBoxes = [];
    this.fileBoxes = [];
    this.fileList = fileList;
    this.firstSelection;
    this.optionPanel = new OptionPane();
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
  boxClick(e, fileBox) {
    const isTouch = isTouchDevice();
    const optionsClick = e.target.closest(".file-options");
    const hasPanel = fileBox.box.contains(this.optionPanel.pane);
    let highlighted = fileBox.isHighlighted();
    //Handle Selection
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(fileBox);
    } else if (
      //Run on touch, and clicking an unhighlighted w/o options OR
      //A highlighted non options
      ((isTouch && (!optionsClick || !highlighted)) || e.ctrlKey) &&
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
class OptionPane {
  constructor() {
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
  normalListeners() {
    const viewOption = this.pane.querySelector("view-option");
    const downloadOption = this.pane.querySelector("download-option");
    const deleteOption = this.pane.querySelector("delete-option");
    const publicOption = this.pane.querySelector("public-option");
    const shareOption = this.pane.querySelector("share-option");
  }

  displayMultiSelection(count) {
    const topElement = this.pane.querySelector("ul").childNodes[0];
    console.log(topElement);
    paneList.insertBefore(multiSelection, paneList.childNodes[0]);
  }
}

function viewFile(file) {
  let win = window.open(`/rawdata?target=${file.uuid}`);
  if (!win || win.closed || typeof win.closed == "undefined") {
    window.location = `/rawdata?target=${file.uuid}`;
  }
}
function downloadFile(file) {
  window.location = `/download?target=${file.uuid}`;
}
function deleteFile(file) {}
function shareFile(file) {}
function togglePublicFile(file) {}
function updateUserFiles(cb) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", userFilesUrl);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (typeof xhr.response === "string") {
        let files = [];
        let file;
        let serverFiles = JSON.parse(xhr.response);
        serverFiles.forEach((serverFile) => {
          file = { ...serverFile };
          const path = serverFile.path;
          const date = path.substring(0, path.indexOf("-"));
          const name = path.substring(path.indexOf("-") + 1);
          file.name = name;
          file.date = date;
          files.push(file);
        });
        cb(files);
      }
    }
  };
  xhr.send();
}
const driveSelector = new DriveSelector(ownedList);
fileDropArea.addEventListener("click", (e) => {
  const fileListParent = e.target.closest(".files");
  const fileParent = e.target.closest(".file");
  if (!fileListParent || !fileParent) {
    driveSelector.clearAllSelection();
    driveSelector.removeOptionsPane();
  }
});
updateUserFiles(function (files) {
  files.forEach((file) => {
    driveSelector.addFilebox(new FileBox(file));
  });
});
