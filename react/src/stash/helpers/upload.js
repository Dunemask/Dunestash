//Module Imports
import axios, { CancelToken } from "axios";
import { toast } from "react-toastify";
//Local Imports
import defaultAxiosConfig from "../helpers/axiosconfig";
import { serverUrls, serverFields } from "../api.json";
//Constants
const uploadUrl = serverUrls.POST.uploadUrl;
const uploadField = serverFields.uploadField;
const cancelMessage = "User Canceled";
//Methods
function handleSelectedFiles(e) {
  //Get timestamp to create an uploadUuid
  const now = Date.now();
  var uploads = this.state.uploads;
  var uploadUuid;
  [...e.target.files].forEach((file, i) => {
    uploadUuid = `${i}-${now}`;
    uploads[uploadUuid] = this.createUpload(file, uploadUuid);
  });
  this.setState({ uploads, fadeOnClear: true });
}
function buildUpload(file, uploadUuid) {
  var upload = {
    file,
    uploadUuid,
    progress: 0,
    status: null,
  };
  const cancelToken = new CancelToken((cancel) => {
    upload.cancelUpload = () => cancel(cancelMessage);
  });
  var config = defaultAxiosConfig;
  config.headers.filesize = file.size;
  config.onUploadProgress = (e) => this.uploadProgress(e, uploadUuid);
  config.cancelToken = cancelToken;
  return { upload, config };
}
function createUpload(file, uploadUuid) {
  var { upload, config } = this.buildUpload(file, uploadUuid);
  const data = new FormData();
  data.append(uploadField, file);
  axios
    .post(uploadUrl, data, config)
    .then((res) => {
      if (res.status === 200) this.uploadDone(res, upload.uploadUuid);
      else this.showError(upload.uploadUuid);
    })
    .catch((e) => {
      if (e.message === cancelMessage) console.log("Upload Canceled");
      else if (e.response == null) toast.error("Unknown Error Occured!");
      else if (e.response.status === 401) toast.error("Not Logged In!");
      else if (e.response.status === 500) toast.error("Drive Full!");
      this.showError(upload.uploadUuid);
    });

  return upload;
}
//Exports
const uploadExports = {
  handleSelectedFiles,
  buildUpload,
  createUpload,
};
export default uploadExports;
