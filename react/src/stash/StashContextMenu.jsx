import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faFileDownload,
  faTrash,
  faEye,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
//Local Imports
import "./scss/stash/StashContextMenu.scss";
import { serverUrls } from "./api.json";
//Constants
const downloadUrl = serverUrls.POST.downloadUrl;
const deleteUrl = serverUrls.POST.deleteUrl;
const publicUrl = serverUrls.POST.publicUrl;
const rawUrl = serverUrls.GET.rawUrl;

function getConfig() {
  var authToken = localStorage.getItem("authToken");
  return { headers: { authorization: authToken } };
}

export default class StashContextMenu extends React.Component {
  infoView() {
    var selectedCount = this.props.getSelectedBoxes().length;
    if (selectedCount === 1) return "View";
    if (selectedCount > 1) return `${selectedCount} files selected`;
    return "No Files Selected";
  }

  infoClick(e) {
    const selectedBoxes = this.props.getSelectedBoxes();
    if (selectedBoxes.length !== 1) return;
    const file = selectedBoxes[0];
    let win = window.open(`${rawUrl}?target=${file}`);
    if (!win || win.closed || typeof win.closed == "undefined") {
      window.location = `${rawUrl}?target=${file}`;
    }
  }
  downloadClick() {
    const selectedBoxes = this.props.getSelectedBoxes();
    //ZIPS ARE NOT SUPPORTED YET
    if (selectedBoxes.length > 1)
      return toast.error("Downloading multiple files is not yet supported!");
    else
      return this.handleDownload(`${downloadUrl}?target=${selectedBoxes[0]}`);
  }
  deleteClick() {
    const selectedBoxes = this.props.getSelectedBoxes();
    axios
      .post(deleteUrl, selectedBoxes, getConfig())
      .then((res) => this.handleDelete(res, selectedBoxes))
      .catch((e) => this.handleDelete(e.response, selectedBoxes));
  }
  publicClick() {
    const selectedBoxes = this.props.getSelectedBoxes();
    axios
      .post(publicUrl, selectedBoxes, getConfig())
      .then((res) => this.handlePublic(res, selectedBoxes))
      .catch((e) => this.handlePublic(e.response, selectedBoxes));
  }

  handlePublic(res, selectedBoxes) {
    const failedFiles = res.data || [];
    if (res.status !== 200)
      toast.error("There was an issue making some files public!");
    let fileBoxes = this.props.fileBoxes;
    selectedBoxes.forEach((selectedBoxId) => {
      if (!failedFiles.includes(selectedBoxId)) {
        fileBoxes[selectedBoxId].file.public = !fileBoxes[selectedBoxId].file
          .public;
      } else {
        fileBoxes[selectedBoxId].selected = true;
      }
    });
    this.props.fileBoxesChanged(fileBoxes);
  }
  handleDownload(url) {
    let win = window.open(url);
    if (!win || win.closed || typeof win.closed == "undefined") {
      window.location = url;
    }
  }
  /**
   * Handles the response from the deleteClick()
   * @param {String} response server response
   * @param {Array} selectedBoxes Selected Boxes object list
   *
   */
  handleDelete(res, selectedBoxes) {
    const failedFiles = res.data || [];
    console.log(res);
    if (res.status !== 200) toast.error("Error Deleting Some Files");
    let fileBoxes = this.props.fileBoxes;
    selectedBoxes.forEach((selectedBoxId) => {
      if (!failedFiles.includes(selectedBoxId)) {
        delete fileBoxes[selectedBoxId];
      } else {
        fileBoxes[selectedBoxId].selected = true;
      }
    });
    this.props.fileBoxesChanged(fileBoxes);
  }
  shareClick() {}

  styleCalc() {
    const estimatedHeight = 180; //px
    const esetimatedWidth = 290; //px
    const bodyWidth = document.body.offsetWidth;
    const bodyHeight = document.documentElement.offsetHeight;
    let top = this.props.y;
    let left = this.props.x;
    const overFlowX = left + esetimatedWidth > bodyWidth;
    const overFlowY = top + estimatedHeight > bodyHeight;
    if (overFlowX) left = left - esetimatedWidth;
    if (overFlowY) top = top - estimatedHeight;
    return { top: `${top}px`, left: `${left}px` };
  }

  render() {
    return (
      <div className="drive-context-menu" style={this.styleCalc()}>
        <ul>
          <li onClick={this.infoClick.bind(this)}>
            <FontAwesomeIcon icon={faInfoCircle} />
            {this.infoView()}
          </li>
          <li onClick={this.downloadClick.bind(this)}>
            <FontAwesomeIcon icon={faFileDownload} />
            Download
          </li>
          <li onClick={this.deleteClick.bind(this)}>
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </li>
          <li onClick={this.publicClick.bind(this)}>
            <FontAwesomeIcon icon={faEye} />
            Toggle Public
          </li>
          <li onClick={this.shareClick.bind(this)}>
            <FontAwesomeIcon icon={faShareSquare} />
            Share
          </li>
        </ul>
      </div>
    );
  }
}
