import React from "react";
export default class DriveBar extends React.Component {
  render() {
    return (
      <div id="abar">
        <div className="abar-actions">
          <label className="abar-action upload-button " htmlFor="file-dropzone">
            Upload <i className="fas fa-cloud-upload-alt"></i>
          </label>
          <div className="file-searchbar abar-action">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="file-search"
              name="file-search"
              placeholder="Search"
              autoComplete="off"
            ></input>
          </div>
        </div>
      </div>
    );
  }
}
