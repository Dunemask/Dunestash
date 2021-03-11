const userFilesUrl = "my-files-list";
const ownedList = document.getElementById("owned-files");
const fileDropArea = document.getElementById("file-drop-area");
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
class DriveSelector {
  constructor(fileList) {
    this.selectedBoxes = [];
    this.fileBoxes = [];
    this.fileList = fileList;
    this.firstSelection;
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
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(fileBox);
    } else if (e.ctrlKey && this.firstSelection) {
      this.additionalSelection(fileBox);
    } else {
      this.singleSelection(fileBox);
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
    this.selectedBoxes.forEach((fileBox, i) => {
      fileBox.unhighlight();
    });
    this.selectedBoxes = [];
  }
}
class FileBox {
  constructor(file) {
    this.file = file;
    this.selected = false;
    this.box = this.buildBox();
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
  if (!fileListParent) {
    driveSelector.clearAllSelection();
  }
});
updateUserFiles(function (files) {
  files.forEach((file) => {
    const fileBox = new FileBox(file);
    driveSelector.addFilebox(fileBox);
  });
});
