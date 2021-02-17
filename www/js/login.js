window.addEventListener('DOMContentLoaded', (event) => {

  document.addEventListener("click", function(evt) {
    var ucontrol = document.getElementById('userControlToggle'),
    targetElement = evt.target;  // clicked element
    let changed=false;
    do {
        if (targetElement == ucontrol) {
            // This is a click inside. Do nothing, just return.
            return;
        }else if(targetElement==document.getElementById('userIcon')){
            ucontrol.style.display= ucontrol.style.display=="none" ? "block" : "none";
            changed=true;
        }
        // Go up the DOM
        targetElement = targetElement.parentNode;
    } while (targetElement);
    if(!changed)
    ucontrol.style.display="none";
  });


});
