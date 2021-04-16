//Local Imports
import Search from "./search";
function updateSelectedFilters() {
  console.log(
    "ATTEMPTING TO ADD FILTER WITH LENGTH",
    this.state.selectedBoxes.length
  );
  console.log("HAS FILTERS", this.state.searchFilters);
  if (this.state.selectedBoxes.length > 0) this.addFilter(Search.filters[0]);
}

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

  this.setState(
    { selectedBoxes, fileBoxes, firstSelection: boxId },
    this.updateSelectedFilters
  );
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
  this.setState({ selectedBoxes, fileBoxes }, this.updateSelectedFilters);
}
function segmentSelection(boxId) {
  let selectedBoxes = this.state.selectedBoxes;
  let fileBoxes = this.state.fileBoxes;
  const wasSelected = fileBoxes[boxId].isSelected;
  fileBoxes[boxId].isSelected = !wasSelected;
  if (wasSelected) selectedBoxes.splice(selectedBoxes.indexOf(boxId), 1);
  else selectedBoxes.push(boxId);
  this.setState({ selectedBoxes, fileBoxes }, this.updateSelectedFilters);
}

function deselectAll() {
  let fileBoxes = this.state.fileBoxes;
  for (var boxId in fileBoxes) {
    fileBoxes[boxId].isSelected = false;
  }

  var searchFilters = this.state.searchFilters;
  var selectIndex;
  if ((selectIndex = searchFilters.indexOf(Search.filters[0])) != -1)
    searchFilters.splice(selectIndex, 1);

  this.setState({
    fileBoxes,
    selectedBoxes: [],
    searchFilters,
  });
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
  this.setState({ fileBoxes, selectedBoxes }, this.updateSelectedFilters);
}

function handleSelectAllPress(e) {
  if (e.target.tagName.toLowerCase() === "textarea") return;
  if (e.target.tagName.toLowerCase() === "input") return;
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
  updateSelectedFilters,
  handleSelectAllPress,
};
export default selectionExports;
