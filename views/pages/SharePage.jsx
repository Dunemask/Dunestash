import React from "react";
module.exports = class SharePage extends React.Component {
  constructor(props) {
    super(props);
    this.file = props.displayFile;
    this.groups = props.groups;
  }
  render() {
    return (
      <div className="share">
        <div className="displayFile">
          <h1>Share</h1>
          <ul>
            <li key={this.file.target}>
              <div className="fileActions">
                <div className="getLinkContainer">
                  <a
                    href={`/rawdata?nemo=${this.file.nemo}&target=${this.file.target}`}
                    className="getLink"
                  >
                    {this.file.filename}
                  </a>
                </div>
                <div className="nemoFileOptions">
                  <a
                    href={`/download?nemo=${this.file.nemo}&target=${this.file.target}`}
                    className="downloadLink"
                  >
                    <i className="fa fa-download"></i>
                  </a>
                  {this.file.options.delete && (
                    <a
                      href={`/delete-file?nemo=${this.file.nemo}&target=${this.file.target}`}
                      className="deleteLink"
                    >
                      <i className="fa fa-trash"></i>
                    </a>
                  )}
                  <span className="filedate">{this.file.date} </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="direct-share">
          <h2>Direct Share</h2>
          <div className="userShareContainer">
            <form
              action={`/share?nemo=${this.file.nemo}&target=${this.file.target}`}
              id="userShare"
              method="POST"
            >
              <div className="form-action">
                <input type="submit" value="Share"></input>
              </div>
              <p>Seperate each username with a comma</p>
              <input
                type="text"
                id="userShareField"
                name="userShareField"
                required
              ></input>
            </form>
          </div>
        </div>
      </div>
    );
  }
};
