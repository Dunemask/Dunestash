//Module Imports
import axios from "axios";
import { serverUrls } from "../api.json";
import { toast } from "react-toastify";
//Local Imports
import defaultAxiosConfig from "./axiosconfig";
//constants
const downloadUrl = serverUrls.POST.downloadUrl;
const deleteUrl = serverUrls.POST.deleteUrl;
const publicUrl = serverUrls.POST.publicUrl;
const rawUrl = serverUrls.GET.rawUrl;

function infoClick(e) {
  if (this.state.selectedBoxes.length !== 1) return;
  const file = this.state.selectedBoxes[0];
  let win = window.open(`${rawUrl}?target=${file}`);
  if (!win || win.closed || typeof win.closed == "undefined") {
    window.location = `${rawUrl}?target=${file}`;
  }
}
function downloadClick() {
  const selectedBoxes = this.state.selectedBoxes;
  //ZIPS ARE NOT SUPPORTED YET
  if (selectedBoxes.length > 1)
    return toast.error("Downloading multiple files is not yet supported!");
  else return this.handleDownload(`${downloadUrl}?target=${selectedBoxes[0]}`);
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
function deleteClick() {
  const selectedBoxes = this.state.selectedBoxes;
  axios
    .post(deleteUrl, JSON.stringify(selectedBoxes), defaultAxiosConfig)
    .then((res) => {
      this.handleDelete(res, selectedBoxes);
    })
    .catch((e) => {
      this.handleDelete(e.response, selectedBoxes);
    });
}
function publicClick() {
  const selectedBoxes = this.state.selectedBoxes;
  axios
    .post(publicUrl, JSON.stringify(selectedBoxes), defaultAxiosConfig)
    .then((res) => {
      this.handlePublic(res, selectedBoxes);
    })
    .catch((e) => {
      this.handlePublic(e.response, selectedBoxes);
    });
}
function handlePublic(res, selectedBoxes) {
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
function handleDownload(url) {
  let win = window.open(url);
  if (!win || win.closed || typeof win.closed == "undefined") {
    window.location = url;
  }
}
/**
 * Handles the response from the deleteClick() function
 * @param {String} response server response
 * @param {Array} selectedBoxes Selected Boxes object list
 *
 */
function handleDelete(res, selectedBoxes) {
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
function shareClick() {}
const selectionExports = {
  infoClick,
  downloadClick,
  deleteClick,
  publicClick,
  shareClick,
  handleDownload,
  handleDelete,
  handlePublic,
};
export default selectionExports;
