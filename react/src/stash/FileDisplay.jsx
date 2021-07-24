//Module Imports
import React from "react";
import PropTypes from "prop-types";
//Local Imports
import FileBox from "./FileBox";
import "./scss/stash/FileDisplay.scss";
class FileDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstSelectionBoxUuid: null,
    };
  }

  displayClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.deselectAll();
    this.props.removeDriveContextMenu();
  }

  fileBoxKeysByPosition() {
    return Object.keys(this.props.fileBoxes).sort((a, b) => {
      return a.position - b.position;
    });
  }

  onSelection(e, boxUuid) {
    var fileBoxes = this.props.fileBoxes;
    var newBoxes;
    const firstSelection = this.state.firstSelectionBoxUuid;
    if (e.ctrlKey && firstSelection !== null)
      newBoxes = this.segmentSelection(fileBoxes, boxUuid);
    else if (e.shiftKey && firstSelection !== null)
      newBoxes = this.multiSelection(fileBoxes, boxUuid);
    else newBoxes = this.singleSelection(fileBoxes, boxUuid);
    this.props.fileBoxesChanged(newBoxes);
  }

  singleSelection(fileBoxes, boxUuid) {
    this.deselectAll();
    this.setState({ firstSelectionBoxUuid: boxUuid });
    fileBoxes[boxUuid].selected = true;
    return fileBoxes;
  }

  segmentSelection(fileBoxes, boxUuid) {
    fileBoxes[boxUuid].selected = !fileBoxes[boxUuid].selected;
    return fileBoxes;
  }

  multiSelection(fileBoxes, boxUuid) {
    this.deselectAll();
    var firstIndex = fileBoxes[this.state.firstSelectionBoxUuid].position;
    var endIndex = fileBoxes[boxUuid].position;
    var boxKeys = this.fileBoxKeysByPosition();
    if (endIndex < firstIndex) {
      let tmp = endIndex;
      endIndex = firstIndex;
      firstIndex = tmp;
    }
    //Send selection 1 more for the slice
    boxKeys.slice(firstIndex, endIndex + 1).forEach((boxId, i) => {
      if (!fileBoxes[boxId].filtered) return;
      fileBoxes[boxId].selected = true;
    });
    return fileBoxes;
  }

  contextSelect(boxUuid) {
    if (this.props.getSelectedBoxes().length > 1) return;
    this.onSelection({}, boxUuid);
  }
  deselectAll() {
    var fileBoxes = this.props.fileBoxes;
    for (var f in fileBoxes) fileBoxes[f].selected = false;
    this.props.fileBoxesChanged(fileBoxes);
  }
  selectAll() {
    var fileBoxes = this.props.fileBoxes;
    for (var f in fileBoxes)
      if (fileBoxes[f].filtered) fileBoxes[f].selected = true;
    this.props.fileBoxesChanged(fileBoxes);
  }
  onBoxKeyPress(e) {
    if (e.keyCode !== 65 || !e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    this.selectAll();
  }
  render() {
    return (
      <div
        className="file-display"
        onClick={this.displayClick.bind(this)}
        onContextMenu={this.props.contextMenu}
      >
        <div className="box-display">
          {this.fileBoxKeysByPosition().map((boxUuid, index) => (
            <React.Fragment key={boxUuid}>
              {this.props.fileBoxes[boxUuid].filtered && (
                <FileBox
                  file={this.props.fileBoxes[boxUuid].file}
                  boxUuid={boxUuid}
                  selected={this.props.fileBoxes[boxUuid].selected}
                  contextMenu={this.props.contextMenu}
                  contextSelect={this.contextSelect.bind(this)}
                  removeDriveContextMenu={this.props.removeDriveContextMenu}
                  onSelection={this.onSelection.bind(this)}
                  onBoxKeyPress={this.onBoxKeyPress.bind(this)}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="file-display-spacer" />
      </div>
    );
  }
}

FileDisplay.propTypes = {
  files: PropTypes.object,
};
export default FileDisplay;
