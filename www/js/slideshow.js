var slideIndex = 1;
let static = false;
showSlidesStatic(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlidesStatic(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlidesStatic(slideIndex = n);
}

function showSlidesStatic(n) {
  var i;
  var slides = document.getElementsByClassName("slide-container");
  var dots = document.getElementsByClassName("slideshow-dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

window.addEventListener('DOMContentLoaded', (event) => {
document.getElementById('prev-slideshow').addEventListener("click", function(evt){
  plusSlides(-1)
  static=true;


});

document.getElementById('next-slideshow').addEventListener("click", function(evt){
  plusSlides(1)
  static=true;


});
for(let i=1;i<=5;i++){
  document.getElementById(`slideshow-dot-${i}`).addEventListener("click", function(evt){
    currentSlide(i);
    static=true;
  });
}


  window.setInterval(function(){ if(!static){plusSlides(1)}},9000);


});
