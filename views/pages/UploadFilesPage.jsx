import React from 'react';
module.exports = class UploadFilesPage extends React.Component{
  render() {
  return (
        <div className="upload-files-content">
        <div id="filewrapper">
          <div className="selectionContainer">
            <div className="fileSelection">
                <form id="fileinput" >
                    <h1>Upload your file</h1>
                    <label>
                        <input type="file" name="userUpload" id="userInput"/><br/>
                        <span className="selectUpload">Select <i className="fa fa-upload"></i></span>
                    </label>
                    <label>
                        <span className="uploadButton"><input type="submit" value="Upload" id="submitUpload"/></span>
                    </label>
                </form>
            </div>
            </div>
          <div className="selectedFileContainer">
            <div id="lower-file-data">
              <div id="selectedFile">
                <h2>No File Selected!</h2>
              </div>
              <div id="fileError"></div>
              <div className="progress-bar" id="uploadPB"  style={{display:"none"}}>
                <div className="progress-bar-fill">
                  <span className="progress-bar-text">0.00%</span>
                </div>
              </div>
              <div className="processing"  style={{display:"none"}}>
                <h2>Processing upload</h2>
                <div className="loader-wrapper">
                  <div className="loader"></div>
                </div>
              </div>
            </div>
          </div>
      </div>
        <script type="text/javascript" src="/js/upload.js"></script>
          </div>
);}}
