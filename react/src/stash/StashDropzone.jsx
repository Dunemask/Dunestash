import React from "react";
import Dropzone from "react-dropzone";
import FileDisplay from "./FileDisplay";

import "./scss/stash/StashDropzone.scss";
class StashDropzone extends React.Component {
  render() {
    return (
      <Dropzone onDrop={(acceptedFiles) => this.props.addUpload(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <div className="stash-dropzone" {...getRootProps()}>
            <input
              id="file-dropzone"
              {...getInputProps()}
              style={{ display: "none", visibility: "hidden" }}
            />
            <FileDisplay
              fileBoxes={this.props.fileBoxes}
              fileBoxesChanged={this.props.fileBoxesChanged}
              contextMenu={this.props.contextMenu}
              removeDriveContextMenu={this.props.removeDriveContextMenu}
              getSelectedBoxes={this.props.getSelectedBoxes}
            />
          </div>
        )}
      </Dropzone>
    );
  }
}

export default StashDropzone;
