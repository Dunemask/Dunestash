//Imports
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
exports.linkedOptions = (target, uuid) => {
  return {
    share: db.authorizedToEditFile(target, uuid),
    delete: db.authorizedToEditFile(target, uuid),
  };
};
exports.ownedOptions = { share: true, delete: true };
exports.filesPageRender = (uuid, linkedMode) => {
  let title, files, displayFiles, fileDisplay, options;
  displayFiles = [];
  //if mode is linked do the linked
  if (linkedMode) {
    title = "Linked Files";
  } else {
    title = "Files";
    files = db.getOwnedFiles(uuid);
    files.forEach((file) => {
      filename = db.getFilePath(file);
      fileDisplay = exports.fileDisplayBuilder(filename);
      displayFiles.push(
        new DisplayFile(
          uuid, //UUID
          file, //Target
          fileDisplay.fileString, //Name
          fileDisplay.date, //Date
          this.ownedOptions
        )
      );
    });
  }
  return { title, displayFiles };
};
exports.sharePageRender = (target) => {
  const file = db.getFile(target);
  const filename = file.path;
  const fileDisplay = this.fileDisplayBuilder(filename);
  return new DisplayFile(
    file.owner, //UUID
    target, //Target
    fileDisplay.fileString, //Name
    fileDisplay.date, //Date
    this.ownedOptions
  );
};
//Seperates Date and creates a nice looking filename
exports.fileDisplayBuilder = (filename) => {
  let fileString, date;
  if (!filename) return { date, fileString };
  date = exports.easyDate(filename.slice(0, filename.indexOf("-")));
  if (date != "") {
    fileString = filename.slice(filename.indexOf("-") + 1, filename.length);
  } else {
    fileString = filename;
  }
  return { date, fileString };
};
//Sharepage prerender
exports.DisplayFile = DisplayFile;
