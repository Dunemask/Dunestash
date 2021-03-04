//Imports
const multer = require("multer");
const fs = require("fs");
const path = require("path");
//Config Import
const db = require("./database.js");
const { Storage, StatusCode } = require("../server-config.json");
//Constants
const imageSizeLimit = Storage.ProfileImageSize * Storage.UserStorageUnit;
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

//User Upload Destination
exports.userUploadDestination = (req, file) => {
  let destination = path.resolve(Storage.UploadPath, req.session.user_id);
  if (!fs.existsSync(path.resolve(Storage.UploadPath)))
    fs.mkdirSync(path.resolve(Storage.UploadPath));
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);
  return destination;
};
exports.userUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, this.userUploadDestination(req, file));
  },
  filename: (req, file, cb) => {
    const n = file.originalname.split(" ").join("_");
    const fileName = `${Date.now()}-${n}`;
    req.on("aborted", () => {
      fs.unlinkSync(
        path.resolve(this.userUploadDestination(req, file), fileName)
      );
      const serverStorage = db.getUserStorageObject(req.session.user_id);
      db.updateUserStorageObject(req.session.user_id, {
        used: serverStorage.used - parseInt(req.headers.filesize),
      });
    });
    cb(null, fileName);
  },
});
exports.userUpload = multer({
  storage: exports.userUploadStorage,
}).single("user-selected-file");
//End Multer -------------------------------------------------------------------
