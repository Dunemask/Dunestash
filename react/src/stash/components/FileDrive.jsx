//Module Imports
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
//Local Imports
import DriveBar from "./DriveBar";
import DriveContextmenu from "./DriveContextMenu";
import FileBox from "./FileBox";
import Fud from "./FileUploadDialog";
import Selection from "../helpers/selection";
import MenuActions from "../helpers/menuactions";
import Search from "../helpers/search";
import defaultAxiosConfig from "../helpers/axiosconfig";
import { serverUrls } from "../api.json";
//Constants
const filesUrl = serverUrls.GET.filesUrl;

export default class FileDrive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileBoxes: {},
      selectedBoxes: [],
      firstSelection: null,
      contextMenu: null,
      searchFilters: [],
      storage: 0,
      maxStorage: 0,
    };
    var f;
    //Bind all Select Functions
    for (f in Selection) {
      if (typeof Search[f] !== "function") continue;
      this[f] = Selection[f].bind(this);
    }
    //Bind all ContextMenu Actions
    for (f in MenuActions) {
      if (typeof Search[f] !== "function") continue;
      this[f] = MenuActions[f].bind(this);
    }
    //Bind all Search Functions
    for (f in Search) {
      if (typeof Search[f] !== "function") continue;
      this[f] = Search[f].bind(this);
    }

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

  fileDisplay() {
    var fileBoxes = this.state.fileBoxes;
    return Object.values(fileBoxes).map((file, index) => (
      <React.Fragment key={file.id}>
        {file.isFiltered && (
          <FileBox
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
        )}
      </React.Fragment>
    ));
  }

  render() {
    return (
      <div className="file-stash">
        <DriveBar
          searchFilters={this.state.searchFilters}
          addFilter={this.addFilter}
          removeFilter={this.removeFilter}
          markAllFiltered={this.markAllFiltered}
          tagAdd={this.tagAdd}
          tagQuery={this.tagQuery}
          searchBarChanged={this.searchBarChanged}
        />
        <div className="user-files" id="file-drop-area">
          <div
            className="file-drive"
            onClick={this.deselectAll}
            onContextMenu={(e) => this.contextMenu(e)}
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
            <div className="files" id="owned-files">
              <h3 className="files-header">My Stash</h3>
              {this.fileDisplay()}
            </div>
            <Fud addFilebox={this.addFilebox} />
          </div>
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
      date: file.date,
      size: file.size,
      public: file.public,
      isSelected: false,
      isFiltered: true,
    };
  }
}
