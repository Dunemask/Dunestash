import React from 'react';
module.exports = class SharePage extends React.Component {
  constructor(props) {
  super(props);
    this.targetFile = props.target;
  }
  render(){
  return (
        <div className="download-content">
          <div className="links-wrapper">
            <h1>{this.props.title}</h1>
            <div className="share" >
              <h2>Share</h2>
              <p>{this.targetFile}</p>
      			</div>

          </div>
      	</div>
  );
}}
