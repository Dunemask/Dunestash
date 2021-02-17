var React = require('react');
module.exports = class MainPage extends React.Component {
  render() {
  return (
    <div className="homepage-content">
      <div className="story-wrapper">
        <div className="story">
          <div className="about-wrapper">
            <div className="about">
                <h2>About</h2>
                <p>
                  This is a file sharing application written by Dunemask!
                </p>
            </div>
            <div className="connections">
                <a href="https://github.com/dunemask"><i className="fa fa-github" aria-hidden="true" style={{fontSize:"43px"}}/></a>
            </div>
            <div className="DM-Foot">
                <h1>Dunemask 2020 All Rights Reserved</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );//Close Return
}//Close Render
}
