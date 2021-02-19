import React from "react";
module.exports = class FilesPage extends React.Component {
  constructor(props) {
    super(props);
    this.title = this.props.title;
    this.files = props.displayFiles;
  }
  render() {
    return (
      <div className="download-content">
        <div className="links-wrapper">
          <div className="filetype-toggle">
            <a href="/files?type=owned">Owned</a>
            <a href="/files?type=linked">Linked</a>
          </div>
          <h1>{this.title}</h1>
          <div className="links" id="ownedFilenames">
            <ul>
              {this.files.map((file, index) => (
                <li key={index}>
                  <div className="fileActions">
                    <a
                      href={`/rawdata?nemo=${file.nemo}&target=${file.target}`}
                      className="getLink"
                    >
                      {file.filename}
                    </a>
                    <div className="nemoFileOptions">
                      <a
                        href={`/download?nemo=${file.nemo}&target=${file.target}`}
                        className="downloadLink"
                      >
                        {" "}
                        <i className="fa fa-download"></i>
                      </a>
                      <a
                        href={`/share?nemo=${file.nemo}&target=${file.target}`}
                        className="shareLink"
                      >
                        {" "}
                        <i className="fa fa-share-square-o"></i>
                      </a>
                      <a
                        href={`/delete-file?nemo=${file.nemo}&target=${file.target}`}
                        className="deleteLink"
                      >
                        {" "}
                        <i className="fa fa-trash"></i>
                      </a>
                        <span className="filedate">{file.date} </span>
                    </div>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
};
