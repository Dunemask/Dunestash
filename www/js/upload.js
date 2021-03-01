function doesQueryStringContainAValue(field, url) {
  if (url.indexOf("?" + field + "=") != -1) return true;
  else if (url.indexOf("&" + field + "=") != -1) return true;
  return false;
}

function setUpProgressBar() {
  const form = document.getElementById("file-upload-form");
  const userInput = document.getElementById("user-selected-upload-file");
  const progressBarFill = document.querySelector(
    "#upload-progress-bar > .upload-progress-bar-fill"
  );
  const progressBarText = progressBarFill.querySelector(
    ".upload-progress-bar-text"
  );
  form.addEventListener("submit", handleUpload);
  function handleUpload(e) {
    e.preventDefault();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.upload.addEventListener("progress", (e) => {
      const percent = e.lengthComputable ? (e.loaded / e.total) * 100 : 0.0;
      progressBarFill.style.width = percent.toFixed(2) + "%";
      progressBarFill.textContent = percent.toFixed(2) + "%";
    });
    xhr.upload.addEventListener("loadstart", (e) => {
      document.getElementById("upload-progress-bar").style.display = "block";
      document.getElementById("user-selected-upload-file").disabled = true;
      document.getElementById("upload-submit-button").disabled = true;
    });
    xhr.upload.addEventListener("timeout", (e) => {
      notifyError("Upload Timed Out!");
    });
    xhr.upload.addEventListener("load", (e) => {
      document.querySelector(".processing").style.display = "inline-flex";
    });
    xhr.upload.addEventListener("error", (e) => {
      notifyError("Unkown Error Occurred!");
    });
    xhr.upload.addEventListener("abort", (e) => {
      notifyError("File upload Canceled!");
    });

    xhr.setRequestHeader(
      "x-filename",
      document.getElementById("user-selected-upload-file").value
    );
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        document.getElementById("lower-file-data").style.display = "none";
        if (xhr.status == 200) {
          let newToast = new DOMParser()
            .parseFromString(xhr.responseText, "application/xml")
            .getElementById("toast-notification");
          console.log(newToast);
          document.open();
          document.write(xhr.responseText);
          document.close();
        } else {
          notifyError("Unkown Error Occurred!");
        }
      }
    };
    xhr.send(new FormData(form));
  }
}

function notifyError(msg) {
  console.error("ERROR:", msg);
  doToastDefault(msg, "error");
}

function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, "$1" + key + "=" + value + "$2");
  } else {
    return uri + separator + key + "=" + value;
  }
}

function fileSelected() {
  let file = document.getElementById("user-selected-upload-file").files[0];
  let fileDisplay = `<h2>Selected File: ${file.name} </h2>`;
  document.getElementById("selected-file").innerHTML = fileDisplay;
}

document
  .getElementById("file-upload-form")
  .addEventListener("change", fileSelected);
setUpProgressBar();
