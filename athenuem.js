//Imports
const db = require("./database.js");
const multer = require("multer");
const fs = require("fs");
//Constants
const FILESIZE_MB = Math.pow(1024, 2);
const FILESIZE_GB = Math.pow(1024, 3);
const defaultFileUploadSize = FILESIZE_MB * 600; //600MB
const imageSizeLimit = FILESIZE_MB * 150; //150MB
exports.easyDate = (date) => {
  let d = new Date(parseInt(date));
  if (isNaN(d.getMonth())){return ""}
  else {
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
};
//Multer -----------------------------------------------------------------------
exports.imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = __dirname + "/www/files/images/user-images/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, req.session.user_id + "-tmp");
  },
});
exports.imageUpload = multer({
  storage: exports.imageStorage,
  limits: { fileSize: imageSizeLimit },
  fileFilter: function (req, file, cb) {
    var filetypes = /jpeg|jpg|png/;
    var correctMimetype = filetypes.test(file.mimetype);
    if (!correctMimetype) {
      req.fileValidationError = true;
      return cb(null, false, new Error("INVALID MIMETYPE"));
    }
    cb(null, true);
  },
}).single("userImage");
//Files Handle-------------------------------------------------------------------
exports.userUploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = __dirname + "/uploads/" + req.session.user_id + "/";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    cb(null, path);
  },
  filename: function (req, file, cb) {
    let n = file.originalname.split(" ").join("_");
    let saveFilename;
    if (n.includes("."))
      saveFilename =
        n.substring(0, n.lastIndexOf(".")) +
        `-${Date.now()}` +
        n.substring(n.lastIndexOf("."));
    else saveFilename = `${n}-${Date.now()}`;
    cb(null, saveFilename);
  },
});
exports.userUpload = multer({
  storage: exports.userUploadStorage,
  limits: { fileSize: defaultFileUploadSize },
}).single("userUpload");
exports.approveFile = function (req) {
  let status = "Success";
  let statusTitle;
  let file = req.file;
  if (!file) {
    status = "Error";
    statusTitle = "No File Uploaded!";
    return { status: status, statusTitle: statusTitle };
  } //Return if there is no File
  let dirLimit = db.getUserStorageSize(req.session.user_id);
  let size = 0;
  let files = fs.readdirSync(file.destination);
  for (f in files) {
    size += fs.statSync(file.destination + files[f]).size;
  }
  if (size + req.file.size > dirLimit) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error(err);
    }
    status = "Error";
    statusTitle = "User Storage Full!";
    return { status: status, statusTitle: statusTitle };
  }
  return { status: status, statusTitle: statusTitle };
};
//End Multer -------------------------------------------------------------------
