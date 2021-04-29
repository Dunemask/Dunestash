import React from "react";
import {
  faBars,
  faCloudUploadAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../scss/stash/Stashbar.scss";

class StashbarMenu extends React.Component {
  render() {
    return (
      <div className="stashbar-menu">
        <span className="stashbar-action">
          <FontAwesomeIcon icon={faBars} />
        </span>
        <span className="stashbar-action">
          <label htmlFor="file-dropzone">
            <FontAwesomeIcon icon={faCloudUploadAlt} />
          </label>
        </span>
        <span
          className="stashbar-action"
          onClick={() => this.props.setSearchMode(true)}
        >
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
    );
  }
}

export default StashbarMenu;
