//Module Imports
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
//Local Imports
import Stashbar from "./stash/Stashbar";
import StashUpload from "./stash/StashUpload";
import StashContextMenu from "./stash/StashContextMenu";
import { serverUrls } from "./stash/api.json";
import "./stash/scss/Stash.scss";
//Constants
const filesUrl = serverUrls.GET.filesUrl;
//Class
function getConfig() {
  var authToken = localStorage.getItem("authToken");
  return { headers: { authorization: authToken } };
}
function buildFilebox(file, index) {
  return {
    file,
    selected: false,
    filtered: true,
    position: index,
  };
}
class Stash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileBoxes: {},
      contextMenu: null,
    };
  }

  componentDidMount() {
    axios.get(filesUrl, getConfig()).then((res) => {
      if (res.status === 401) {
        console.log("Would redirect to login");
        return;
      }
      if (res.data === undefined || res.data.length === undefined) {
        toast.error("Error Loading Files");
        return;
      }
      var fileBoxes = {};
      var counter = 0;
      res.data.forEach((file, index) => {
        fileBoxes[file.fileUuid] = buildFilebox(file, index);
      });
      this.setState({ fileBoxes });
    });
  }
  fileBoxesChanged(fileBoxes) {
    this.setState({ fileBoxes });
  }

  getSelectedBoxes() {
    var selectedBoxes = [];
    for (var f in this.state.fileBoxes) {
      if (!this.state.fileBoxes[f].filtered) continue;
      if (!this.state.fileBoxes[f].selected) continue;
      selectedBoxes.push(f);
    }
    return selectedBoxes;
  }

  addFilebox(file) {
    var fileBoxes = this.state.fileBoxes;
    fileBoxes[file.fileUuid] = buildFilebox(
      file,
      Object.keys(fileBoxes).length
    );
    this.setState({ fileBoxes });
  }

  removeDriveContextMenu() {
    if (this.state.contextMenu !== null) this.setState({ contextMenu: null });
  }

  /*Options Menu Functions*/
  contextMenu(e) {
    this.removeDriveContextMenu();
    if (e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      contextMenu: {
        x: e.clientX,
        y: e.clientY,
      },
    });
  }
  render() {
    return (
      <div
        className="dunestash"
        onClick={this.removeDriveContextMenu.bind(this)}
      >
        <Stashbar
          fileBoxes={this.state.fileBoxes}
          fileBoxesChanged={this.fileBoxesChanged.bind(this)}
          contextMenu={this.contextMenu.bind(this)}
        />
        {this.state.contextMenu && (
          <StashContextMenu
            x={this.state.contextMenu.x}
            y={this.state.contextMenu.y}
            fileBoxes={this.state.fileBoxes}
            fileBoxesChanged={this.fileBoxesChanged.bind(this)}
            getSelectedBoxes={this.getSelectedBoxes.bind(this)}
          />
        )}

        <div className="stash">
          <StashUpload
            addFilebox={this.addFilebox.bind(this)}
            fileBoxes={this.state.fileBoxes}
            fileBoxesChanged={this.fileBoxesChanged.bind(this)}
            contextMenu={this.contextMenu.bind(this)}
            removeDriveContextMenu={this.removeDriveContextMenu.bind(this)}
            getSelectedBoxes={this.getSelectedBoxes.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default Stash;
