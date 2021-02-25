import React from "react";
import Page from "../Page";
const title = "Share";
module.exports = class Share extends Page {
  constructor(props) {
    super({
      uuid: props.uuid,
      status: props.status,
      title,
    });
    this.file = props.displayFile;
    this.groups = props.groups;
  }
  render() {
    return (
      <>
        {this.BuildPage(
          <div className="share">
            <div className="display-file">
              <h1>Share</h1>
              <ul>
                <li key={this.file.target}>
                  <div className="file-actions">
                    <div className="link-container-get">
                      <a
                        href={`/rawdata?nemo=${this.file.nemo}&target=${this.file.target}`}
                        className="link-get"
                      >
                        {this.file.filename}
                      </a>
                    </div>
                    <div className="file-options">
                      <a
                        href={`/download?nemo=${this.file.nemo}&target=${this.file.target}`}
                        className="link-download"
                      >
                        <i className="fa fa-download"></i>
                      </a>
                      {this.file.options.delete && (
                        <a
                          href={`/delete-file?nemo=${this.file.nemo}&target=${this.file.target}`}
                          className="link-delete"
                        >
                          <i className="fa fa-trash"></i>
                        </a>
                      )}
                      <span className="file-date">{this.file.date} </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="direct-share">
              <h2>Direct Share</h2>
              <div className="user-share-container">
                <form
                  action={`/share?nemo=${this.file.nemo}&target=${this.file.target}`}
                  id="user-share"
                  method="POST"
                >
                  <div className="form-action">
                    <input type="submit" value="Share"></input>
                  </div>
                  <p>Seperate each username with a comma</p>
                  <input
                    type="text"
                    id="user-share-field"
                    name="user-share-field"
                    required
                  ></input>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
};
