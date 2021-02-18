import React from 'react';
module.exports = class DownloadsPage extends React.Component {
  constructor(props) {
  super(props);
  this.ownedFiles = [];
    for(let key in props.ownedFiles){
      this.ownedFiles.push({nemo:props.userId,filename:key});
    }
  }
  render(){
  return (
        <div className="download-content">
          <div className="links-wrapper">
            <h1>{this.props.title}</h1>
            <div className="links" id="ownedFiles">
              <h2>Your Files</h2>
              <ul>
              {this.ownedFiles.map((file,index) => (
                <li key={index}>
                  <a href={`/rawdata?nemo=${file.nemo}&target=${file.filename}`} className="getLink">{file.filename}</a>
                  <div className="nemoFileOptions">
                    <a href={`/download?nemo=${file.nemo}&target=${file.filename}`} className="downloadLink"> <i className="fa fa-download"></i></a>
                    <a href={`/share?nemo=${file.nemo}&target=${file.filename}`} className="shareLink"> <i className="fa fa-share-square-o"></i></a>
                    <a href={`/delete-file?nemo=${file.nemo}&target=${file.filename}`} className="deleteLink"> <i className="fa fa-trash"></i></a>
                  </div>
              </li>
              ))}
              </ul>
      			</div>

          </div>
      	</div>
  );
}}
