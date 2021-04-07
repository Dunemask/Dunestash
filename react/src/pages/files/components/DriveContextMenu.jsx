import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faFileDownload,
  faTrash,
  faEye,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
export default class DriveContextMenu extends React.Component {
  infoView() {
    if (this.props.selectedCount === 1) return "View";
    if (this.props.selectedCount > 1)
      return `${this.props.selectedCount} files selected`;
  }

  styleCalc() {
    const fileDriveTopMargin = 144; //px
    const estimatedHeight = 180; //px
    const esetimatedWidth = 290; //px
    const body = document.body;
    const bodyWidth = body.offsetWidth;
    const bodyHeight = body.offsetHeight;
    let top = this.props.y;
    let left = this.props.x;
    const overFlowX = left + esetimatedWidth > bodyWidth;
    const overFlowY = top + fileDriveTopMargin > bodyHeight;
    if (overFlowX) left = left - esetimatedWidth;
    if (overFlowY) top = top - estimatedHeight;

    return { top: `${top}px`, left: `${left}px` };
  }

  render() {
    return (
      <div className="file-option-pane" style={this.styleCalc()}>
        <ul>
          <li onClick={this.props.infoClick}>
            <FontAwesomeIcon icon={faInfoCircle} />
            {this.infoView()}
          </li>
          <li onClick={this.props.downloadClick}>
            <FontAwesomeIcon icon={faFileDownload} />
            Download
          </li>
          <li onClick={this.props.deleteClick}>
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </li>
          <li onClick={this.props.publicClick}>
            <FontAwesomeIcon icon={faEye} />
            Make Public
          </li>
          <li onClick={this.props.shareClick}>
            <FontAwesomeIcon icon={faShareSquare} />
            Share
          </li>
        </ul>
      </div>
    );
  }
}
