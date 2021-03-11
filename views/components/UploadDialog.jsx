import React from "react";
module.exports = class UploadDialog extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="fud">
        <div id="fud-header">
          <div id="fud-header-status">
            <span id="fud-status-icon">
              <i className="fas fa-cloud-upload-alt fud-success-icon"></i>
              <i className="fas fa-exclamation-triangle fud-error-icon"></i>
              <span className="fud-error-wrapper">
                <i className="fas fa-circle"></i>
                <span id="fud-error-count"></span>
              </span>
            </span>
          </div>
          <div className="fud-header-title-wrapper">
            <span id="fud-header-title">
              Uploads
              <span id="fud-minimize">
                <i className="fas fa-angle-down"></i>
              </span>
            </span>
          </div>
          <div className="fud-actions">
            <span id="fud-retry" className="fud-action">
              <i className="fas fa-redo-alt"></i>
            </span>
            <span id="fud-clear" className="fud-action">
              <i className="fas fa-times"></i>
            </span>
          </div>
        </div>
        <div id="fud-queued-files"></div>
      </div>
    );
  }
};
