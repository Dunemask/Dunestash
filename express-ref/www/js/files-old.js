const fileContainers = document.querySelectorAll(".file-contents");
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
    fileDate.innerHTML = this.file.date;
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
    this.box.classList.contains("highlight");
  }
  highlight() {
    this.box.classList.add("highlight");
  }
  unhighlight() {
    this.box.classList.remove("highlight");
  }
  toggleHighlight() {
    if (this.isHighlighted()) {
      this.unhighlight();
    } else {
      this.highlight();
    }
  }
  isSelected() {
    return this.selected;
  }
  select() {
    this.selected = true;
  }
  deselect() {
    this.selected = false;
  }
  toggleSelection() {
    this.selected = !this.selected();
  }
}
class DriveSelector {
  constructor() {
    this.fileBoxes = [];
    this.firstSelection;
  }
  fileSelection(e) {
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(e);
    } else if (e.ctrlKey && this.firstSelection) {
      this.additionalSelection(e);
    } else {
      this.singleSelection(e);
    }
  }
  singleSelection(e) {
    this.clearAllSelection();
    this.toggleHighlight(e.target);
    this.firstSelection = e.target.closest(".file");
    this.fileBoxes = [this.firstSelection];
  }
  multiSelection(e) {
    const fileParent = e.target.closest(".files");
    //If this element doesn't actually have the first selection, ignore it
    if (!fileParent.contains(this.firstSelection)) return;
    const siblings = [...fileParent.childNodes];
    //The end index always needs to be increased by one
    let startIndex = siblings.indexOf(this.firstSelection);
    let endIndex = siblings.indexOf(e.target.closest(".file")) + 1;
    if (startIndex >= endIndex) {
      let tmpIndex = endIndex;
      endIndex = startIndex + 1; //Flipperflopper to include missing elements
      startIndex = tmpIndex - 1;
    }
    this.clearAllSelection();
    siblings.slice(startIndex, endIndex).forEach((fc, i) => {
      this.selectionHighlight(fc.querySelector(".file-contents"));
      this.fileBoxes.push(fc);
    });
  }
  additionalSelection(e) {
    const wasSelected = this.toggleHighlight(e.target);
    this.firstSelection = e.target.closest(".file");
    if (wasSelected) {
      this.fileBoxes.splice(
        this.fileBoxes.indexOf(e.target.closest(".file")),
        1
      );
    } else {
      this.fileBoxes.push(e.target.closest(".file"));
    }
  }
  clearAllSelection() {
    fileContainers.forEach((fc, i) => {
      this.selectionUnhighlight(fc);
    });
    this.fileBoxes = [];
  }
}
class FileSelector {
  constructor() {
    this.fileBoxes = [];
    this.firstSelection;
  }
  selectionHighlight(target) {
    target.classList.add("highlight");
  }
  selectionUnhighlight(target) {
    target.classList.remove("highlight");
  }
  toggleHighlight(target) {
    const fileContents = target.closest(".file-contents");
    const isSelected = fileContents.classList.contains("highlight");
    if (!isSelected) {
      this.selectionHighlight(fileContents);
    } else {
      this.selectionUnhighlight(fileContents);
    }
    return isSelected;
  }
  fileSelection(e) {
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(e);
    } else if (e.ctrlKey && this.firstSelection) {
      this.additionalSelection(e);
    } else {
      this.singleSelection(e);
    }
    console.log(this.fileBoxes.length);
  }
  singleSelection(e) {
    const wasSelected = this.clearAllSelection();
    this.toggleHighlight(e.target);
    this.firstSelection = e.target.closest(".file");
    this.fileBoxes = [this.firstSelection];
  }
  multiSelection(e) {
    const fileParent = e.target.closest(".files");
    //If this element doesn't actually have the first selection, ignore it
    if (!fileParent.contains(this.firstSelection)) return;
    const siblings = [...fileParent.childNodes];
    //The end index always needs to be increased by one
    let startIndex = siblings.indexOf(this.firstSelection);
    let endIndex = siblings.indexOf(e.target.closest(".file")) + 1;
    if (startIndex >= endIndex) {
      let tmpIndex = endIndex;
      endIndex = startIndex + 1; //Flipperflopper to include missing elements
      startIndex = tmpIndex - 1;
    }
    this.clearAllSelection();
    siblings.slice(startIndex, endIndex).forEach((fc, i) => {
      this.selectionHighlight(fc.querySelector(".file-contents"));
      this.fileBoxes.push(fc);
    });
  }
  additionalSelection(e) {
    const wasSelected = this.toggleHighlight(e.target);
    this.firstSelection = e.target.closest(".file");
    if (wasSelected) {
      this.fileBoxes.splice(
        this.fileBoxes.indexOf(e.target.closest(".file")),
        1
      );
    } else {
      this.fileBoxes.push(e.target.closest(".file"));
    }
  }
  clearAllSelection() {
    fileContainers.forEach((fc, i) => {
      this.selectionUnhighlight(fc);
    });
    this.fileBoxes = [];
  }
}
let fileSelector = new FileSelector();
fileContainers.forEach((fc) => {
  //fc.parentNode.addEventListener("click", fileSelect);
  fc.addEventListener("click", (e) => fileSelector.fileSelection(e));
});

function getRecentFiles() {
  let recentFiles = [];
  for (let i = 0; i < 4; i++) {
    recentFiles.push({
      name: "Recent File.txt",
      date: Date.now(),
      size: "1000",
    });
  }
  return recentFiles;
}
function getUserFiles(start, end) {
  let files = [];
  for (let i = start; i < end; i++) {
    files.push({
      name: "Normal File.txt",
      date: Date.now(),
      size: "100",
    });
  }
  return files;
}

let files = getUserFiles(0, 50);
const ownedFiles = document.getElementById("owned-files");
files.forEach((file) => {
  const box = new FileBox(file);

  ownedFiles.append(box.box);
});
