window.addEventListener('DOMContentLoaded', (event) => {

document.getElementById("imageUpload").onchange = function() {
    document.getElementById("userImageUpload").submit();
};
/*document.addEventListener("click", function(evt) {
  var passChangeElm = document.getElementById('login-form'),
  targetElement = evt.target,
  invisipage =document.getElementById('invisiPage'),
  triggerElement=document.getElementById('changePasswordTrigger') ;  // clicked element
  let changed=false;
  do {
      if (targetElement == passChangeElm) {
          // This is a click inside. Do nothing, just return.
          return;
      }else if(targetElement==document.getElementById('userIcon')||targetElement==document.getElementById('cancelPasswordChange')){
          invisipage.style.display= "none";
          changed=true;
      }else if(targetElement==triggerElement){
          invisipage.style.display="block";
          changed=true;
          document.getElementById('originalPassword').focus()
      }
      // Go up the DOM
      targetElement = targetElement.parentNode;
      console.log("targetElement");
  } while (targetElement);
  if(!changed)
  invisipage.style.display="none";

});*/

/*document.getElementById('changePasswordTrigger').addEventListener("click",function(evt){
  document.getElementById('login-box').style.display="block";

});*/

});
