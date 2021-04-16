import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faEye,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
function readableDate(date) {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())) return "";
  return `${
    d.getMonth() + 1
  }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
}
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
            <div className="file-info-details">
              <span className="file-name">{this.props.fileName}</span>
            </div>
            <div className="file-info-details">
              <span className="file-date file-subinfo-details">
                {readableDate(this.props.fileDate)}
              </span>
              {this.props.public && (
                <span className="file-indicators file-subinfo-details">
                  {this.props.public && <FontAwesomeIcon icon={faEye} />}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}