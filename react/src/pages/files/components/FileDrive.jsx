import React from "react";
import FileBox from "./FileBox";
import Fud from "./FileUploadDialog";
import { serverUrls, constants } from "../../../api.json";
import axios from "axios";
import DriveContextmenu from "./DriveContextMenu";
import { toast } from "react-toastify";
const downloadUrl = serverUrls.POST.downloadUrl;
const deleteUrl = serverUrls.POST.deleteUrl;
const publicUrl = serverUrls.POST.publicUrl;
const filesUrl = serverUrls.GET.filesUrl;
const rawUrl = serverUrls.GET.rawUrl;
const jwtHeader = constants.jwtHeader;
const authToken = localStorage.getItem("authToken");
const defaultAxiosConfig = {
  headers: { "Content-Type": "application/json" },
};
defaultAxiosConfig.headers[jwtHeader] = authToken;

function easyDate(date) {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())) {
    return "";
  } else {
    return `${
      d.getMonth() + 1
    }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
}
export default class FileDrive extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileBoxes: {},
      selectedBoxes: [],
      firstSelection: null,
      optionsPane: null,
      contextMenu: null,
      storage: 0,
      maxStorage: 0,
    };
    //Bind Select Functions and adding function
    this.handleSelectAllPress = this.handleSelectAllPress.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
    this.addFilebox = this.addFilebox.bind(this);
    // Bind Context Menu Functions
    this.contextMenu = this.contextMenu.bind(this);
    this.preventNormalContextMenu = this.preventNormalContextMenu.bind(this);
    this.removeDriveContextMenu = this.removeDriveContextMenu.bind(this);
    //Bind Context Menu Click Functions
    this.infoClick = this.infoClick.bind(this);
    this.downloadClick = this.downloadClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.deleteHandle = this.deleteHandle.bind(this);
    this.publicClick = this.publicClick.bind(this);
    this.shareClick = this.shareClick.bind(this);
  }
  selectBox(id, e) {
    this.removeDriveContextMenu();
    e.stopPropagation();
    const firstSelection = this.state.firstSelection;
    if (e.ctrlKey && firstSelection !== null) this.segmentSelection(id);
    else if (e.shiftKey && firstSelection !== null) this.multiSelection(id);
    else this.singleSelection(id);
  }
  singleSelection(boxId) {
    this.deselectAll();
    let selectedBoxes = this.state.selectedBoxes;
    let fileBoxes = this.state.fileBoxes;
    fileBoxes[boxId].isSelected = true;
    selectedBoxes = [boxId];
    this.setState({ selectedBoxes, fileBoxes, firstSelection: boxId });
  }
  multiSelection(boxId) {
    this.deselectAll();
    let fileBoxes = this.state.fileBoxes;
    var fileBoxKeys = Object.keys(fileBoxes);
    let boxIndex = fileBoxKeys.indexOf(boxId);
    let firstIndex = fileBoxKeys.indexOf(this.state.firstSelection);
    if (boxIndex < firstIndex) {
      let tmp = boxIndex;
      boxIndex = firstIndex;
      firstIndex = tmp;
    }
    //Send selection 1 more for the slice
    let selectedBoxes = new Array(1 + boxIndex - firstIndex);
    fileBoxKeys.slice(firstIndex, boxIndex + 1).forEach((boxId, i) => {
      fileBoxes[boxId].isSelected = true;
      selectedBoxes[i] = boxId;
    });
    this.setState({ selectedBoxes, fileBoxes });
  }
  segmentSelection(boxId) {
    let selectedBoxes = this.state.selectedBoxes;
    let fileBoxes = this.state.fileBoxes;
    const wasSelected = fileBoxes[boxId].isSelected;
    fileBoxes[boxId].isSelected = !wasSelected;
    if (wasSelected) selectedBoxes.splice(selectedBoxes.indexOf(boxId), 1);
    else selectedBoxes.push(boxId);
    this.setState({ selectedBoxes, fileBoxes });
  }
  deselectAll() {
    let fileBoxes = this.state.fileBoxes;
    for (var boxId in fileBoxes) {
      fileBoxes[boxId].isSelected = false;
    }
    this.setState({ fileBoxes, selectedBoxes: [] });
  }
  selectAll() {
    let fileBoxes = this.state.fileBoxes;
    let fileBoxLength = Object.keys(fileBoxes).length;
    let firstSelection = this.state.firstSelection;
    let selectedBoxes = new Array(fileBoxLength);
    if (firstSelection === null && fileBoxLength > 0)
      firstSelection = fileBoxes[0];
    for (var boxId in fileBoxes) {
      fileBoxes[boxId].isSelected = true;
      selectedBoxes.push(boxId);
    }
    this.setState({ fileBoxes, selectedBoxes });
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
  infoClick(e) {
    if (this.state.selectedBoxes.length !== 1) return;
    const file = this.state.selectedBoxes[0];
    let win = window.open(`${rawUrl}?target=${file}`);
    if (!win || win.closed || typeof win.closed == "undefined") {
      window.location = `${rawUrl}?target=${file}`;
    }
  }
  downloadClick() {
    const selectedBoxes = this.state.selectedBoxes;
    //ZIPS ARE NOT SUPPORTED YET
    if (selectedBoxes.length > 1)
      return toast.error("Downloading multiple files is not yet supported!");
    else
      return this.handleDownload(`${downloadUrl}?target=${selectedBoxes[0]}`);
    axios
      .post(downloadUrl, JSON.stringify(selectedBoxes), defaultAxiosConfig)
      .then((res) => {
        console.log("GOT RESPONSE");
        if (res.status !== 200 || !res.data)
          return toast.error("Error Zipping Files!");
        this.handleDownload(`${downloadUrl}?zipTarget=${res.data}`);
      })
      .catch((e) => {
        toast.error("Error Downloading!");
        console.log(e.response);
      });
  }
  handleDownload(url) {
    let win = window.open(url);
    if (!win || win.closed || typeof win.closed == "undefined") {
      window.location = url;
    }
  }
  deleteClick() {
    const selectedBoxes = this.state.selectedBoxes;
    axios
      .post(deleteUrl, JSON.stringify(selectedBoxes), defaultAxiosConfig)
      .then((res) => {
        this.deleteHandle(res, selectedBoxes);
      })
      .catch((e) => {
        this.deleteHandle(e.response, selectedBoxes);
      });
  }
  /**
   * Handles the response from the deleteClick() function
   * @param {String} response server response
   * @param {Array} selectedBoxes Selected Boxes object list
   *
   */
  deleteHandle(res, selectedBoxes) {
    const failedFiles = res.data || [];
    if (res.status !== 200) toast.error("Error Deleting Some Files");
    let fileBoxes = this.state.fileBoxes;
    selectedBoxes.forEach((selectedBoxId) => {
      if (!failedFiles.includes(selectedBoxId)) {
        delete fileBoxes[selectedBoxId];
      } else {
        fileBoxes[selectedBoxId].isSelected = true;
      }
    });
    this.setState({ fileBoxes });
  }
  addFilebox(file) {
    let fileBoxes = this.state.fileBoxes;
    fileBoxes[file.fileUuid] = {
      id: file.fileUuid,
      name: file.name,
      date: easyDate(file.date),
      size: file.size,
      public: file.public,
      isSelected: false,
    };
    this.setState({ fileBoxes });
  }
  publicClick() {
    const selectedBoxes = this.state.selectedBoxes;
    axios
      .post(publicUrl, JSON.stringify(selectedBoxes), defaultAxiosConfig)
      .then((res) => {
        this.publicHandle(res, selectedBoxes);
      })
      .catch((e) => {
        this.publicHandle(e.response, selectedBoxes);
      });
  }
  publicHandle(res, selectedBoxes) {
    const failedFiles = res.data || [];
    if (res.status !== 200)
      toast.error("There was an issue making some files public!");
    let fileBoxes = this.state.fileBoxes;
    selectedBoxes.forEach((selectedBoxId) => {
      if (!failedFiles.includes(selectedBoxId)) {
        fileBoxes[selectedBoxId].public = !fileBoxes[selectedBoxId].public;
      } else {
        fileBoxes[selectedBoxId].isSelected = true;
      }
    });
    this.setState({ fileBoxes });
  }

  shareClick() {}
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
  handleSelectAllPress(e) {
    if (!(this.state.selectedBoxes.length > 0)) return;
    if (e.key === "a" && e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
      this.selectAll();
    } else if (e.key === "Backspace" || e.key === "Delete") this.deleteClick();
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
          fileBoxes[file.fileUuid] = {
            id: file.fileUuid,
            name: file.name,
            date: easyDate(file.date),
            size: file.size,
            public: file.public,
            isSelected: false,
          };

          this.setState({ fileBoxes }, () => {});
        });
      })
      .catch((e) => console.error(e));
  }
}
