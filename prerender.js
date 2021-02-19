const db = require("./database.js");
//Filepage Prerender Prep
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
exports.filesPageRender = (linkedMode, uuid) => {
  let title, displayFiles, filenames, fileString, dateExtensionString, date;
  displayFiles = [];
  //if mode is linked do the linked
  if (linkedMode) {
    title = "Linked Files";
    filenames = db.getLinkedFiles(uuid);
    Object.keys(filenames).forEach((filename) => {
      fileString = filename.slice(0, filename.lastIndexOf("-"));
      dateExtensionString = filename.slice(
        filename.lastIndexOf(fileString) + 1
      );
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
      displayFiles.push({
        nemo: filenames[filename],
        target: filename,
        filename: fileString,
        date,
        options: {
          share: db.authorizedToEditFile(filenames[filename], filename, uuid),
          delete: db.authorizedToEditFile(filenames[filename], filename, uuid),
        },
      });
    });
  } else {
    title = "Files";
    filenames = db.getOwnedFiles(uuid);
    Object.keys(filenames).forEach((filename) => {
      fileString = filename.slice(0, filename.lastIndexOf("-"));
      dateExtensionString = filename.slice(
        filename.lastIndexOf(fileString) + 1
      );
      date = exports.easyDate(
        dateExtensionString.slice(
          filename.lastIndexOf("-"),
          dateExtensionString.indexOf(".")
        )
      );
      fileString += dateExtensionString.slice(
        dateExtensionString.indexOf("."),
        dateExtensionString.length
      );
      displayFiles.push({
        nemo: uuid,
        target: filename,
        filename: fileString,
        date,
        options: {
          share: true,
          delete: true,
        },
      });
    });
  }
  return { title, displayFiles };
};
