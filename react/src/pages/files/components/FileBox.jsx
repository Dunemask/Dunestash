import React from "react";
export default class FileDrive extends React.Component {
  render() {
    return (
      <div
        className="file"
        onClick={(e) => this.props.selectBox(e)}
        onContextMenu={(e) => this.props.onContextMenu(e)}
        onKeyUp={(e) => this.props.handleSelectAllPress(e)}
      >
        <div
          className={
            this.props.isSelected ? "file-contents highlight" : "file-contents"
          }
        >
          <div className="file-info">
            <span className="file-name">{this.props.fileName}</span>
            <span className="file-date">{this.props.fileDate}</span>
          </div>
        </div>
      </div>
    );
  }
}
