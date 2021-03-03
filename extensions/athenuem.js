//Imports
const multer = require("multer");
const fs = require("fs");
const path = require("path");
//Config Import
const db = require("./database.js");
const { Storage, StatusCode } = require("../server-config.json");
//Constants
const FILESIZE_MB = Math.pow(1024, 2);
const uploadSizeLimit = Storage.UploadMaxSize * FILESIZE_MB;
const imageSizeLimit = Storage.ProfileImageSize * FILESIZE_MB;
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
  filename: (req, file, cb) => {
    cb(null, req.session.user_id + "-tmp");
  },
});
exports.imageUpload = multer({
  storage: exports.imageStorage,
  limits: { fileSize: imageSizeLimit },
  fileFilter: (req, file, cb) => {
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
  filename: (req, file, cb) => {
    let n = file.originalname.split(" ").join("_");
    cb(null, `${Date.now()}-${n}`);
  },
});
exports.userUpload = multer({
  storage: exports.userUploadStorage,
}).single("user-selected-file");
exports.approveFile = (req) => {
  let status = { type: StatusCode.Success, tag: "Upload Successful!" };
  let file = req.file;
  if (!file) {
    status.type = StatusCode.Error;
    status.tag = "No File Uploaded!";
    return status;
  } //Return if there is no File
  let dirLimit = db.getUserStorageSize(req.session.user_id) * FILESIZE_MB;
  let size = req.file.size;
  let files = fs.readdirSync(path.resolve(file.destination));
  for (f in files) {
    size += fs.statSync(path.resolve(file.destination, files[f])).size;
  }
  if (!!uploadSizeLimit && req.file.size > uploadSizeLimit) {
    status.type = StatusCode.Error;
    status.tag = "File Surpasses Upload Size Limit!";
    fs.unlinkSync(path.resolve(req.file.path));
  } else if (size > dirLimit) {
    status.type = StatusCode.Error;
    status.tag = "File Exceeds User Storage Capacity!";
    fs.unlinkSync(path.resolve(req.file.path));
  }
  return status;
};
//End Multer -------------------------------------------------------------------
