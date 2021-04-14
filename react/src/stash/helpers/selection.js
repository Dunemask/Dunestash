function selectBox(id, e) {
  this.removeDriveContextMenu();
  e.stopPropagation();
  const firstSelection = this.state.firstSelection;
  if (e.ctrlKey && firstSelection !== null) this.segmentSelection(id);
  else if (e.shiftKey && firstSelection !== null) this.multiSelection(id);
  else this.singleSelection(id);
}
function singleSelection(boxId) {
  this.deselectAll();
  let selectedBoxes = this.state.selectedBoxes;
  let fileBoxes = this.state.fileBoxes;
  fileBoxes[boxId].isSelected = true;
  selectedBoxes = [boxId];
  this.setState({ selectedBoxes, fileBoxes, firstSelection: boxId });
}
function multiSelection(boxId) {
  this.deselectAll();
  let fileBoxes = this.state.fileBoxes;
  var fileBoxKeys = Object.keys(fileBoxes);
  let boxIndex = fileBoxKeys.indexOf(boxId);
  let firstIndex = fileBoxKeys.indexOf(this.state.firstSelection);
  if (boxIndex < firstIndex) {
    let tmp = boxIndex;
    boxIndex = firstIndex;
    firstIndex = tmp;
  }
  //Send selection 1 more for the slice
  let selectedBoxes = new Array(1 + boxIndex - firstIndex);
  fileBoxKeys.slice(firstIndex, boxIndex + 1).forEach((boxId, i) => {
    fileBoxes[boxId].isSelected = true;
    selectedBoxes[i] = boxId;
  });
  this.setState({ selectedBoxes, fileBoxes });
}
function segmentSelection(boxId) {
  let selectedBoxes = this.state.selectedBoxes;
  let fileBoxes = this.state.fileBoxes;
  const wasSelected = fileBoxes[boxId].isSelected;
  fileBoxes[boxId].isSelected = !wasSelected;
  if (wasSelected) selectedBoxes.splice(selectedBoxes.indexOf(boxId), 1);
  else selectedBoxes.push(boxId);
  this.setState({ selectedBoxes, fileBoxes });
}

function deselectAll() {
  let fileBoxes = this.state.fileBoxes;
  for (var boxId in fileBoxes) {
    fileBoxes[boxId].isSelected = false;
  }
  this.setState({ fileBoxes, selectedBoxes: [] });
}
function selectAll() {
  let fileBoxes = this.state.fileBoxes;
  let fileBoxLength = Object.keys(fileBoxes).length;
  let firstSelection = this.state.firstSelection;
  let selectedBoxes = new Array(fileBoxLength);
  if (firstSelection === null && fileBoxLength > 0)
    firstSelection = fileBoxes[0];
  for (var boxId in fileBoxes) {
    fileBoxes[boxId].isSelected = true;
    selectedBoxes.push(boxId);
  }
  this.setState({ fileBoxes, selectedBoxes });
}

function handleSelectAllPress(e) {
  if (!(this.state.selectedBoxes.length > 0)) return;
  if (e.key === "a" && e.ctrlKey) {
    e.stopPropagation();
    e.preventDefault();
    this.selectAll();
  } else if (e.key === "Backspace" || e.key === "Delete") this.deleteClick();
}
const selectionExports = {
  selectBox,
  singleSelection,
  segmentSelection,
  multiSelection,
  deselectAll,
  selectAll,
  handleSelectAllPress,
};
export default selectionExports;
