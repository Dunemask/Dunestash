import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faEye,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";

import PropTypes from "prop-types";
import "./scss/stash/FileBox.scss";
class FileBox extends React.Component {
  readableDate() {
    let d = new Date(parseInt(this.props.file.date));
    if (isNaN(d.getMonth())) return "";
    return `${
      d.getMonth() + 1
    }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
  selectBox(e) {
    e.stopPropagation();
    e.preventDefault();
    this.props.onSelection(e, this.props.boxUuid);
    this.props.removeDriveContextMenu();
  }

  render() {
    return (
      <div
        tabIndex="0"
        className={"filebox" + (this.props.selected ? " selected" : "")}
        onClick={this.selectBox.bind(this)}
        onContextMenu={() => this.props.contextSelect(this.props.boxUuid)}
        onKeyDown={this.props.onBoxKeyPress}
      >
        <div className="file">
          <div className="file-details">
            <span className="file-name">{this.props.file.name}</span>
          </div>
          <div className="file-details">
            <span className="file-date">{this.readableDate()}</span>
            {this.props.file.public && (
              <span className="file-indicators file-subinfo-details">
                {this.props.file.public && <FontAwesomeIcon icon={faEye} />}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}
FileBox.propTypes = {
  file: PropTypes.object,
};

export default FileBox;
