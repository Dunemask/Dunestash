import React from "react";
class StashbarSearchTagDisplay extends React.Component {
  filterClicked(tag) {
    this.props.updateQuery("");
    this.props.addTag(tag);
  }
  displayTags() {
    const tags = this.props.getAvailableTags();
    if (tags.length === 0)
      return (
        <span className="query-filter">No Filters Matched Your Search</span>
      );
    else
      return (
        <React.Fragment>
          {tags.map((tag, index) => (
            <span
              className="query-filter"
              key={index}
              onClick={() => this.filterClicked.bind(this)(tag)}
            >
              {tag}
            </span>
          ))}
        </React.Fragment>
      );
  }

  render() {
    return (
      <div className="query-filters">
        <div className="query-filter-list">{this.displayTags()}</div>
      </div>
    );
  }
}

export default StashbarSearchTagDisplay;
