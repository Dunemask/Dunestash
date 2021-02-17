import React from 'react';
module.exports = class FrontpageSlideshow extends React.Component {
  render() {
  return (
<div className="slideshow-wrapper">
  <h1>Home</h1>
  <div className="slideshow-container">

    <div className="slide-container fade">
      <div className="numbertext">5 / 5</div>
      <img src="/files/images/slideshow/Elijah.jpg"style={{width:"100%"}}/>
      <div className="caption">Elijah Parker (Dunemask)</div>
    </div>
    <div className="slide-container fade">
      <div className="numbertext">1 / 5</div>
      <img src="/files/images/slideshow/Codepen.png"style={{width:"100%"}}/>
      <div className="caption">Codepen Website Replication</div>
    </div>
    <div className="slide-container fade">
      <div className="numbertext">2 / 5</div>
      <img src="/files/images/slideshow/Server-Manager.png"style={{width:"100%"}} />
      <div className="caption">Minecraft Web Server Manager</div>
    </div>
    <div className="slide-container fade">
      <div className="numbertext">3 / 5</div>
      <img src="/files/images/slideshow/Movieplayer.png"style={{width:"100%"}}/>
      <div className="caption">Java Multi-Mediaplayer</div>
    </div>
    <div className="slide-container fade">
      <div className="numbertext">4 / 5</div>
      <img src="/files/images/slideshow/Voxelcraft.jpeg"style={{width:"100%"}}/>
      <div className="caption">Java Voxel-Engine Game</div>
    </div>
    <a className="prev" id="prev-slideshow">&#10094;</a>
    <a className="next" id="next-slideshow">&#10095;</a>
  </div>
  <br/>
  <div className="slideshow-dot-container">
    <span className="slideshow-dot" id="slideshow-dot-1"></span>
    <span className="slideshow-dot" id="slideshow-dot-2"></span>
    <span className="slideshow-dot" id="slideshow-dot-3"></span>
    <span className="slideshow-dot" id="slideshow-dot-4"></span>
    <span className="slideshow-dot" id="slideshow-dot-5"></span>
  </div>
  <script src="/js/slideshow.js"></script>
</div>
)}};
