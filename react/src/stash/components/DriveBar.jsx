//Module Imports
import React from "react";
import {
  faSearch,
  faCloudUploadAlt,
  faTimes,
  faBars,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//Local Imports
import Search from "../helpers/search";
export default class DriveBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryTags: [],
      searchMode: false,
      query: "",
    };
  }

  buildTop() {
    if (!this.state.searchMode)
      return (
        <div className="drivebar-actions">
          <span className="drivebar-action">
            <FontAwesomeIcon icon={faBars} />
          </span>
          <span className="drivebar-action">
            <label htmlFor="file-dropzone">
              <FontAwesomeIcon icon={faCloudUploadAlt} />
            </label>
          </span>
          <span
            className="drivebar-action"
            onClick={() => {
              this.setState({ searchMode: true });
              this.props.searchBarChanged(this.state.query);
            }}
          >
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>
      );
    else
      return (
        <div className="file-searchbar">
          <div className="file-searchbox">
            <span
              className="search-back"
              onClick={() => {
                this.setState({ searchMode: false });
                this.props.markAllFiltered();
              }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </span>
            <input
              type="text"
              id="file-search"
              name="file-search"
              placeholder="Search"
              value={this.state.query}
              autoComplete="off"
              onChange={(e) => {
                this.props.searchBarChanged(e.target.value);
                this.setState({
                  query: e.target.value,
                  tags: this.props.tagQuery(e.target.value),
                });
              }}
              onKeyUp={(e) => {
                const newQuery = this.props.tagAdd(this.state.query, e);
                if (newQuery != null)
                  this.setState({ query: newQuery }, () =>
                    this.props.searchBarChanged(this.state.query)
                  );
              }}
            ></input>
            {this.state.queryTags.length > 0 && <h1>HELLO WORLD</h1>}
          </div>

          {this.props.searchFilters && this.props.searchFilters.length > 0 && (
            <div className="file-filters">
              {this.props.searchFilters.map((filter, index) => (
                <span className="file-filter" key={index}>
                  <span> {filter}</span>{" "}
                  <FontAwesomeIcon
                    icon={faTimes}
                    onClick={(e) => {
                      this.props.removeFilter(filter);
                      this.props.searchBarChanged(this.state.query);
                    }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      );
  }

  render() {
    return (
      <div className="drivebar">
        <div className="drivebar-content">{this.buildTop()}</div>
      </div>
    );
  }
}
