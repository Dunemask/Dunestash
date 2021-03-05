import React from "react";
module.exports = class UploadDialog extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="file-upload-dialog">
        <div id="file-upload-dialog-header">
          <div id="file-upload-dialog-header-status">
            <span id="file-upload-dialog-status-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </span>
            <span id="file-upload-dialog-error-count"></span>
          </div>
          <span id="file-upload-dialog-header-title">Uploads</span>
          <span id="file-upload-dialog-minimize">
            <i className="fas fa-angle-down"></i>
          </span>
        </div>
        <div id="selected-files">
          <div id="pending-files"></div>
          <div id="failed-files"></div>
        </div>
      </div>
    );
  }
};
