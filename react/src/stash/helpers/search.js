//Constants
const filters = ["Selected", "Public"];
const tagChar = "#";
function addFilter(filter) {
  var filters = this.state.searchFilters;
  if (filters.indexOf(filter) == -1) filters.push(filter);
  this.setState({ searchFilters: filters });
}

function removeFilter(filter) {
  console.log("CALLED TO REMOVE FILTER");
  var filters = this.state.searchFilters;
  filters.splice(filters.indexOf(filter), 1);
  this.setState({ searchFilters: filters });
}

async function markAllFiltered() {
  var fileBoxes = this.state.fileBoxes;
  Object.keys(fileBoxes).forEach((boxId, i) => {
    fileBoxes[boxId].isFiltered = true;
  });
  await this.setState({ fileBoxes });
}

async function searchBarChanged(text, e) {
  text = text.toLowerCase();
  const activeFilters = this.state.searchFilters;
  await this.markAllFiltered();
  var fileBoxes = this.state.fileBoxes;
  Object.keys(fileBoxes).forEach((boxId, i) => {
    //If file isn't selected
    if (
      activeFilters.includes(filters[0]) &&
      fileBoxes[boxId].isSelected !== true
    )
      fileBoxes[boxId].isFiltered = false;
    //If file isn't public
    else if (
      activeFilters.includes(filters[1]) &&
      fileBoxes[boxId].public !== true
    )
      fileBoxes[boxId].isFiltered = false;
    else if (!fileBoxes[boxId].name.toLowerCase().includes(text))
      fileBoxes[boxId].isFiltered = false;
  });
  this.setState({ fileBoxes });
}

function tagAdd(text, e) {
  if (e.key !== "Enter" || text == null || text[0] !== tagChar) return;
  const space = " ";
  text = text.substring(1, text.length);
  //Skip the "selected filter" which should only be triggered when there are
  //files already selected.
  var i = 1;
  for (i; i < filters.length; i++) {
    if (filters[i].toLowerCase().includes(text)) break;
  }
  if (!this.state.searchFilters.includes(filters[i]))
    this.addFilter(filters[i]);
  var firstSpace = text.indexOf(space) + 1;
  if (firstSpace === 0) return "";
  return text.substring(firstSpace, text.length);
}

function tagQuery(text) {
  if (text == null || text[0] !== tagChar) return;
  text = text.substring(1, text.length);
  var i = 1;
  var tags = [];
  for (i; i < filters.length; i++) {
    if (filters[i].toLowerCase().includes(text)) tags.push(filters[i]);
  }
  console.log("TAGS:", tags);
  return tags;
}

const searchExport = {
  addFilter,
  removeFilter,
  markAllFiltered,
  tagAdd,
  tagQuery,
  searchBarChanged,
  filters,
};

export default searchExport;