const db = require("./database.js");

exports.easyDate = (date) => {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())) {
    return "";
  } else {
    return `${
      d.getMonth() + 1
    }/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
};

const DisplayFile = class {
  constructor(nemo, target, filename, date, options) {
    this.nemo = nemo;
    this.target = target;
    this.filename = filename;
    this.date = date;
    this.options = options;
  }
};
//Filepage Prerender Prep
//Builds a list of files to display
exports.linkedOptions = (nemo, target, uuid) => {
  return {
    share: db.authorizedToEditFile(nemo, target, uuid),
    delete: db.authorizedToEditFile(nemo, target, uuid),
  };
};
exports.ownedOptions = { share: true, delete: true };
exports.filesPageRender = (uuid, linkedMode) => {
  let title, filenames, displayFiles, fileDisplay, options;
  displayFiles = [];
  //if mode is linked do the linked
  if (linkedMode) {
    title = "Linked Files";
    filenames = db.getLinkedFiles(uuid);
    Object.keys(filenames).forEach((filename) => {
      fileDisplay = exports.fileDisplayBuilder(filename);
      displayFiles.push(
        new DisplayFile(
          filenames[filename],
          filename,
          fileDisplay.fileString,
          fileDisplay.date,
          exports.linkedOptions(filenames[filename], filename, uuid)
        )
      );
    });
  } else {
    title = "Files";
    filenames = db.getOwnedFiles(uuid);
    Object.keys(filenames).forEach((filename) => {
      fileDisplay = exports.fileDisplayBuilder(filename);
      displayFiles.push(
        new DisplayFile(
          uuid,
          filename,
          fileDisplay.fileString,
          fileDisplay.date,
          exports.ownedOptions
        )
      );
    });
  }
  return { title, displayFiles };
};
//Seperates Date and creates a nice looking filename
exports.fileDisplayBuilder = (filename) => {
  let fileString, dateExtensionString, date;
  fileString = filename.slice(0, filename.lastIndexOf("-"));
  dateExtensionString = filename.slice(filename.lastIndexOf(fileString) + 1);
  date = exports.easyDate(
    dateExtensionString.slice(
      filename.lastIndexOf("-"),
      dateExtensionString.indexOf(".")
    )
  );
  if (date != "") {
    fileString += dateExtensionString.slice(
      dateExtensionString.indexOf("."),
      dateExtensionString.length
    );
  } else {
    fileString = filename;
  }
  return { date, fileString };
};
//Sharepage prerender
exports.DisplayFile = DisplayFile;
