import React from "react";
import {
  faTimes,
  faArrowLeft,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//Local imports
import StashbarSearchTagDisplay from "./StashbarSearchTagDisplay";
import "../scss/stash/Searchbar.scss";
//Constants
const hashtagChar = "#";
const searchFilters = ["Selected", "Public"];
class StashbarSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      query: "",
    };
  }

  //Filtering Functions

  updateQuery(query) {
    this.setState({ query }, this.updateFiltered);
  }

  updateFiltered() {
    var fileBoxes = this.markAllFiltered();
    const activeTags = this.state.tags;
    const query = this.state.query.toLowerCase();
    for (var f in fileBoxes) {
      //If file isn't selected
      if (activeTags.includes(searchFilters[0]) && !fileBoxes[f].selected)
        fileBoxes[f].filtered = false;
      //If file isn't public
      if (activeTags.includes(searchFilters[1]) && !fileBoxes[f].file.public) {
        fileBoxes[f].filtered = false;
      }
      if (!fileBoxes[f].file.name.toLowerCase().includes(query))
        fileBoxes[f].filtered = false;
    }
    this.setState({ fileBoxes });
  }

  markAllFiltered() {
    var fileBoxes = this.props.fileBoxes;
    for (var f in fileBoxes) {
      fileBoxes[f].filtered = true;
    }
    this.props.fileBoxesChanged(fileBoxes);
    return fileBoxes;
  }

  //Searchbar Functions
  searchChanged(e) {
    this.updateQuery(e.target.value);
  }

  searchbarClose() {
    this.markAllFiltered();
    this.props.setSearchMode(false);
  }
  //Tag Functions
  hashtagClick() {
    this.updateQuery(hashtagChar);
  }

  queryTag(e) {
    var query = this.state.query;
    if (e.key !== "Enter" || query[0] !== hashtagChar) return;
    const emptySpace = "";
    const space = " ";
    query = query.substring(1).toLowerCase();
    const filters = this.getAvailableTags();
    var filter = null;
    for (filter of filters) {
      if (filter.toLowerCase().includes(query)) break;
    }
    if (filter !== null) this.addTag(filter);
    var firstSpace = query.indexOf(space);
    if (firstSpace === -1) query = emptySpace;
    else query = query.substring(query.indexOf(space));
    this.updateQuery(query);
  }

  removeTag(tag) {
    var tags = this.state.tags;
    tags.splice(tags.indexOf(tag), 1);
    this.setState({ tags }, this.updateFiltered);
  }

  addTag(tag) {
    var tags = this.state.tags;
    tags.push(tag);
    this.setState({ tags }, this.updateFiltered);
  }

  getAvailableTags() {
    var availableFilters = [];
    searchFilters.forEach((filter, i) => {
      if (i === 0) return; //Ignore first filter 'Selected' triggered by selecting
      if (this.state.tags.includes(filter)) return;
      if (
        !filter
          .toLowerCase()
          .includes(this.state.query.substring(1).toLowerCase())
      )
        return;
      availableFilters.push(filter);
    });
    return availableFilters;
  }
  //Render
  render() {
    return (
      <React.Fragment>
        <div className="file-searchbar stashbar-menu">
          <div className="file-searchbox">
            <span
              className="file-searchbox-action"
              onClick={this.searchbarClose.bind(this)}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </span>
            <input
              type="text"
              id="file-search"
              name="file-search"
              placeholder="Search"
              value={this.state.query}
              onChange={this.searchChanged.bind(this)}
              autoComplete="off"
              onKeyUp={this.queryTag.bind(this)}
            ></input>
            <span
              className="file-searchbox-action"
              id="file-searchbox-hashtag"
              onClick={this.hashtagClick.bind(this)}
            >
              <FontAwesomeIcon icon={faHashtag} />
            </span>
          </div>
        </div>
        <div className="file-searchbar-extensions">
          {this.state.query.includes(hashtagChar) && (
            <StashbarSearchTagDisplay
              query={this.state.query}
              getAvailableTags={this.getAvailableTags.bind(this)}
              addTag={this.addTag.bind(this)}
              updateQuery={this.updateQuery.bind(this)}
            />
          )}
          {this.state.tags.length > 0 && (
            <div className="file-filters">
              {this.state.tags.map((filter, index) => (
                <span className="file-filter" key={index}>
                  <span> {filter}</span>{" "}
                  <FontAwesomeIcon
                    icon={faTimes}
                    onClick={() => this.removeTag(filter)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default StashbarSearch;
