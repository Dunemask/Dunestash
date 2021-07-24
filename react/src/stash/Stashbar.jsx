//Module Imports
import React from "react";
//Local Imports
import StashbarMenu from "./stashbar/StashbarMenu.jsx";
import StashbarSearch from "./stashbar/StashbarSearch.jsx";
class Stashbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchMode: false,
    };
  }

  setSearchMode(value) {
    this.setState({ searchMode: value });
  }

  whichBar() {
    if (this.state.searchMode)
      return (
        <StashbarSearch
          fileBoxes={this.props.fileBoxes}
          fileBoxesChanged={this.props.fileBoxesChanged}
          setSearchMode={this.setSearchMode.bind(this)}
        />
      );
    else return <StashbarMenu setSearchMode={this.setSearchMode.bind(this)} />;
  }

  render() {
    return (
      <div className="stashbar">
        <div className="stashbar-content">{this.whichBar()}</div>
      </div>
    );
  }
}

export default Stashbar;
