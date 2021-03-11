const fileContainers = document.querySelectorAll(".file-contents");

class FileSelector {
  constructor() {
    this.selectedFiles = [];
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
  }
  fileSelection(e) {
    if (e.shiftKey && this.firstSelection) {
      this.multiSelection(e);
    } else {
      this.singleSelection(e);
    }
  }
  singleSelection(e) {
    this.clearAllSelection();
    this.toggleHighlight(e.target);
    this.firstSelection = e.target.closest(".file");
    this.selectedFiles = [this.firstSelection];
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
      this.toggleHighlight(fc.querySelector(".file-contents"));
      this.selectedFiles.push(fc);
    });
  }
  clearAllSelection() {
    fileContainers.forEach((fc, i) => {
      this.selectionUnhighlight(fc);
    });
    this.selectedFiles = [];
  }
}

let fileSelector = new FileSelector();
fileContainers.forEach((fc) => {
  //fc.parentNode.addEventListener("click", fileSelect);
  fc.addEventListener("click", (e) => fileSelector.fileSelection(e));
});
