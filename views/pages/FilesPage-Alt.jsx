import React from "react";
module.exports = class FilesPage extends React.Component {
  constructor(props) {
    super(props);
    console.log(props.ownedFilenames);
    this.ownedFilenames = props.ownedFilenames;
    this.linkedFilenames = props.linkedFilenames;
  }
  render() {
    return (
      <div className="download-content">
        <div className="links-wrapper">
          <h1>{this.props.title}</h1>
          <div className="links" id="ownedFilenames">
            <h2>Your Files</h2>
            <ul>
              {this.ownedFilenames.map((file, index) => (
                <li key={index}>
                  <a
                    href={`/rawdata?nemo=${file.nemo}&target=${file.filename}`}
                    className="getLink"
                  >
                    {file.filename}
                  </a>
                  <div className="nemoFileOptions">
                    <a
                      href={`/download?nemo=${file.nemo}&target=${file.filename}`}
                      className="downloadLink"
                    >
                      {" "}
                      <i className="fa fa-download"></i>
                    </a>
                    <a
                      href={`/share?nemo=${file.nemo}&target=${file.filename}`}
                      className="shareLink"
                    >
                      {" "}
                      <i className="fa fa-share-square-o"></i>
                    </a>
                    <a
                      href={`/delete-file?nemo=${file.nemo}&target=${file.filename}`}
                      className="deleteLink"
                    >
                      {" "}
                      <i className="fa fa-trash"></i>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="links" id="linkedFilenames">
            <h2>Linked Files</h2>
            <ul>
              {this.linkedFilenames.map((file, index) => (
                <li key={index}>
                  <a
                    href={`/rawdata?nemo=${file.nemo}&target=${file.filename}`}
                    className="getLink"
                  >
                    {file.filename}
                  </a>
                  <div className="nemoFileOptions">
                    <a
                      href={`/download?nemo=${file.nemo}&target=${file.filename}`}
                      className="downloadLink"
                    >
                      {" "}
                      <i className="fa fa-download"></i>
                    </a>
                    <a
                      href={`/share?nemo=${file.nemo}&target=${file.filename}`}
                      className="shareLink"
                    >
                      {" "}
                      <i className="fa fa-share-square-o"></i>
                    </a>
                    <a
                      href={`/delete-file?nemo=${file.nemo}&target=${file.filename}`}
                      className="deleteLink"
                    >
                      {" "}
                      <i className="fa fa-trash"></i>
                    </a>
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
