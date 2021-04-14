//Module Imports
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
//Local Imports
import DriveContextmenu from "./DriveContextMenu";
import FileBox from "./FileBox";
import Fud from "./FileUploadDialog";
import Selection from "../helpers/selection";
import MenuActions from "../helpers/menuactions.js";
import defaultAxiosConfig from "../helpers/axiosconfig";
import { serverUrls } from "../api.json";
//Constants
const filesUrl = serverUrls.GET.filesUrl;

function readableDate(date) {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())) return "";
  return `${
    d.getMonth() + 1
  }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
}
export default class FileDrive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileBoxes: {},
      selectedBoxes: [],
      firstSelection: null,
      contextMenu: null,
      storage: 0,
      maxStorage: 0,
    };
    //Bind Select Functions and adding function
    this.selectAll = Selection.selectAll.bind(this);
    this.deselectAll = Selection.deselectAll.bind(this);
    this.handleSelectAllPress = Selection.handleSelectAllPress.bind(this);
    //Selection Methods
    this.singleSelection = Selection.singleSelection.bind(this);
    this.multiSelection = Selection.multiSelection.bind(this);
    this.segmentSelection = Selection.segmentSelection.bind(this);
    this.selectBox = Selection.selectBox.bind(this);
    //Context Menu Actions
    this.infoClick = MenuActions.infoClick.bind(this);
    this.downloadClick = MenuActions.downloadClick.bind(this);
    this.deleteClick = MenuActions.deleteClick.bind(this);
    this.publicClick = MenuActions.publicClick.bind(this);
    this.shareClick = MenuActions.shareClick.bind(this);
    //Context Menu Action Handlers
    this.handlePublic = MenuActions.handlePublic.bind(this);
    this.handleDelete = MenuActions.handleDelete.bind(this);
    this.handlePublic = MenuActions.handlePublic.bind(this);
    //Context Menu Display
    this.contextMenu = this.contextMenu.bind(this);
    this.preventNormalContextMenu = this.preventNormalContextMenu.bind(this);
    this.removeDriveContextMenu = this.removeDriveContextMenu.bind(this);
    //Filebox method
    this.addFilebox = this.addFilebox.bind(this);
  }
  /*Options Menu Functions*/
  contextMenu(e, ignoreLength) {
    this.removeDriveContextMenu();
    if (
      (this.state.selectedBoxes.length > 0 || ignoreLength) &&
      this.preventNormalContextMenu(e)
    )
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
        className="file-drive"
        onClick={this.deselectAll}
        onContextMenu={(e) => this.contextMenu(e)}
        style={{
          overflowY: this.state.contextMenu === null ? "scroll" : "hidden",
          right: this.state.contextMenu === null ? "0px" : "2.5px",
        }}
      >
        {this.state.contextMenu != null && (
          <DriveContextmenu
            x={this.state.contextMenu.x}
            y={this.state.contextMenu.y}
            selectedCount={this.state.selectedBoxes.length}
            infoClick={this.infoClick}
            downloadClick={this.downloadClick}
            deleteClick={this.deleteClick}
            publicClick={this.publicClick}
            shareClick={this.shareClick}
          />
        )}
        <Fud addFilebox={this.addFilebox} />
        <div className="files" id="owned-files">
          <h3 className="files-header">My Files</h3>
          {Object.values(this.state.fileBoxes).map((file, index) => (
            <FileBox
              key={file.id}
              fileName={file.name}
              fileDate={file.date}
              selectBox={(e) => this.selectBox(file.id, e)}
              isSelected={file.isSelected}
              public={file.public}
              onContextMenu={(e) => {
                if (this.state.selectedBoxes.length < 2)
                  this.singleSelection(file.id);
                this.contextMenu(e, true);
              }}
              handleSelectAllPress={this.handleSelectAllPress}
            />
          ))}
        </div>
      </div>
    );
  }
  //Context Menu
  preventNormalContextMenu(e) {
    if (!e.shiftKey && !e.ctrlKey) e.preventDefault();
    return !e.shiftKey && !e.ctrlKey;
  }
  removeDriveContextMenu(e) {
    if (this.state.contextMenu !== null) this.setState({ contextMenu: null });
  }
  componentDidMount() {
    document.addEventListener("contextmenu", this.preventNormalContextMenu);
    document.addEventListener("click", this.removeDriveContextMenu);
    document.onkeyup = this.handleSelectAllPress;
    this.initializeFileBoxes();
  }
  componentWillUnmount() {
    document.removeEventListener("contextmenu", this.preventNormalContextMenu);
    document.removeEventListener("click", this.removeDriveContextMenu);
    document.onkeyup = null;
  }
  initializeFileBoxes() {
    axios
      .get(filesUrl, defaultAxiosConfig)
      .then((res) => {
        if (res.status === 401) {
          console.log("Would redirect to login");
          return;
        }
        if (res.data === undefined || res.data.length === undefined) {
          toast.error("Error Loading Files");
          return;
        }
        let fileBoxes = {};
        res.data.forEach((file, index) => {
          fileBoxes[file.fileUuid] = this.buildFilebox(file);
        });
        this.setState({ fileBoxes });
      })
      .catch((e) => console.error(e));
  }
  addFilebox(file) {
    let fileBoxes = this.state.fileBoxes;
    fileBoxes[file.fileUuid] = this.buildFilebox(file);
    this.setState({ fileBoxes });
  }
  buildFilebox(file) {
    return {
      id: file.fileUuid,
      name: file.name,
      date: readableDate(file.date),
      size: file.size,
      public: file.public,
      isSelected: false,
    };
  }
}
