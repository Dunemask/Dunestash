document.addEventListener("click", function (evt) {
  let profileActions = document.getElementById("user-control-toggle"),
    targetElement = evt.target; // clicked element
  let changed = false;
  do {
    if (targetElement == profileActions) {
      // This is a click inside. Do nothing, just return.
      return;
    } else if (targetElement == document.getElementById("user-icon")) {
      profileActions.style.display =
        profileActions.style.display == "none" ? "block" : "none";
      changed = true;
    }
    // Go up the DOM
    targetElement = targetElement.parentNode;
  } while (targetElement);
  if (!changed) profileActions.style.display = "none";
});
/*const urlParams = new URLSearchParams(window.location.search);
const displayToast = (status) => {
  Toastify({
    text: status.tag,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor: colors[status.type.toLowerCase()],
    stopOnFocus: true, // Prevents dismissing of toast on hover
    onClick: function () {}, // Callback after click
  }).showToast();
};

const displayMe = (type, tag) => {
  displayToast({ type, tag });
};

//displayToast({type:"success",tag:"YEEEEBOI"});
let status = {};
if(urlParams.has("status")){
  if (urlParams.has("statusTag")) {
    status.tag = urlParams.get("statusTag");
  } else {
    status.tag = urlParams.get("status")+"!";
  }
}*/
