//Module Imports
import React from "react";
import {
  faSearch,
  faCloudUploadAlt,
  faTimes,
  faBars,
  faArrowLeft,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//Local Imports
export default class DriveBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryTags: [],
      searchMode: false,
      query: "",
    };
  }

  getTagQuery(text) {
    var possibleTags = this.props.tagQuery(text);
    if (possibleTags == null) return [];
    for (var i = possibleTags.length - 1; i >= 0; i--) {
      if (this.props.searchFilters.includes(possibleTags[i]))
        possibleTags.splice(i, 1);
    }
    return possibleTags;
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
              className="file-searchbox-action"
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
                  queryTags: this.getTagQuery(e.target.value),
                });
              }}
              onKeyUp={(e) => {
                const newQuery = this.props.tagAdd(this.state.query, e);
                if (newQuery != null)
                  this.setState(
                    {
                      query: newQuery,
                      queryTags: this.getTagQuery(newQuery),
                    },
                    () => this.props.searchBarChanged(this.state.query)
                  );
              }}
            ></input>
            <span
              className="file-searchbox-action"
              id="file-searchbox-hashtag"
              onClick={() => {
                const query = "#";
                this.setState({
                  query,
                  queryTags: this.getTagQuery(query),
                });
              }}
            >
              <FontAwesomeIcon icon={faHashtag} />
            </span>
          </div>
          {this.buildQueryFilters()}
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

  buildQueryFilters() {
    return (
      <>
        {this.state.queryTags.length > 0 && this.state.query != null && (
          <div className="query-filters">
            <div className="query-filter-list">
              {this.state.queryTags.map((tag, index) => (
                <span
                  className="query-filter"
                  key={index}
                  onClick={(e) => {
                    //Trick the method to run the tagAdd method
                    e.key = "Enter";
                    const newQuery = this.props.tagAdd(
                      `#${e.target.innerText}`,
                      e
                    );
                    if (newQuery != null)
                      this.setState(
                        {
                          query: newQuery,
                          queryTags: this.getTagQuery(newQuery),
                        },
                        () => this.props.searchBarChanged(this.state.query)
                      );
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </>
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
