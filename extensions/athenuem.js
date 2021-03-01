//Imports
const multer = require("multer");
const fs = require("fs");
const path = require("path");
//Config Import
const db = require("./database.js");
const { Storage, StatusCode } = require("../server-config.json");
//Constants
const FILESIZE_MB = Math.pow(1024, 2);
const imageSizeLimit = FILESIZE_MB * Storage.ProfileImageSize; //150MB
const imageFileTypes = /jpeg|jpg|png/;
//Multer -----------------------------------------------------------------------
exports.imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = path.resolve(Storage.UserImagePath);
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
    const correctMimetype = imageFileTypes.test(file.mimetype);
    if (!correctMimetype) {
      req.fileValidationError = true;
      return cb(null, false, new Error("INVALID MIMETYPE"));
    }
    cb(null, true);
  },
}).single("user-image");
//Files Handle-------------------------------------------------------------------
exports.userUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = path.resolve(Storage.UploadPath, req.session.user_id);
    if (!fs.existsSync(path.resolve(Storage.UploadPath)))
      fs.mkdirSync(path.resolve(Storage.UploadPath));
    if (!fs.existsSync(destination)) fs.mkdirSync(destination);

    cb(null, destination);
  },
  filename: function (req, file, cb) {
    let n = file.originalname.split(" ").join("_");
    cb(null, `${Date.now()}-${n}`);
  },
});
exports.userUpload = multer({
  storage: exports.userUploadStorage,
  /*limits: { fileSize: defaultFileUploadSize },*/
}).single("user-selected-upload-file");
exports.approveFile = (req) => {
  let status = { type: "Success", tag: "Upload Successful!" };
  let file = req.file;
  if (!file) {
    status.type = StatusCode.Error;
    status.tag = "No File Uploaded!";
    return status;
  } //Return if there is no File
  let dirLimit = db.getUserStorageSize(req.session.user_id) * FILESIZE_MB;
  let size = 0;
  let files = fs.readdirSync(path.resolve(file.destination));
  for (f in files) {
    size += fs.statSync(path.resolve(file.destination, files[f])).size;
  }
  if (size + req.file.size > dirLimit) {
    try {
      fs.unlinkSync(path.resolve(req.file.path));
    } catch (err) {
      console.error(err);
    }
    status.type = StatusCode.Error;
    status.tag = "User Storage Full!";
    return status;
  }
  return status;
};
//End Multer -------------------------------------------------------------------
