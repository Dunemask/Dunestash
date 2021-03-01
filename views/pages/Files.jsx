import React from "react";
import Page from "../Page";
module.exports = class Files extends Page {
  constructor(props) {
    const title = props.linkedMode ? "Linked Files" : "Files";
    super({
      uuid: props.uuid,
      status: props.status,
      title,
      stylesheet: "/css/Files.css",
    });
    this.files = props.displayFiles;
    this.linkedMode = props.linkedMode;
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="download-content">
            <div className="links-wrapper">
              <div className="filetype-toggle">
                <a href="my-files?type=owned">Owned</a>
                <a href="my-files?type=linked">Linked</a>
              </div>
              <h1>{this.title}</h1>
              <div className="links" id="file-display">
                <ul>
                  {!!this.files &&
                    this.files.map((file, index) => (
                      <li key={index}>
                        <div className="file-actions">
                          <a
                            href={`/rawdata?target=${file.target}`}
                            className="link-get"
                          >
                            {file.filename}
                          </a>
                          <div className="file-options">
                            <a
                              href={`/download?target=${file.target}`}
                              className="link-download"
                            >
                              <i className="fas fa-file-download"></i>
                            </a>
                            <a
                              href={`/share?&target=${file.target}`}
                              className="link-share"
                            >
                              <i className="fas fa-share-square"></i>
                            </a>
                            <a
                              href={`/delete-file?target=${file.target}`}
                              className="link-delete"
                            >
                              <i className="fas fa-trash"></i>
                            </a>
                            <span className="file-date">{file.date} </span>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
              {!!this.files && this.files.length == 0 && !this.linkedMode && (
                <h2>
                  No files found{" "}
                  <a href="/upload" id="no-files-link">
                    click here{" "}
                  </a>
                  to upload some!
                </h2>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
};
