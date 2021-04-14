//Module Imports
const fs = require("fs");
const { resolve: resolvePath } = require("path");
const multer = require("multer");
//Local Imports
const config = require("../config.json");
//Multer Configs
const userUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadDestination(req));
  },
  filename: (req, file, cb) => {
    const n = file.originalname.replaceAll(" ", "_");
    const fileName = `${Date.now()}-${n}`;
    req.on("aborted", () => {
      this.cancelUpload(resolvePath(userUploadDestination(req), fileName));
    });
    cb(null, fileName);
  },
});
const userUpload = multer({
  storage: userUploadStorage,
}).single("user-selected-file");

//Helper Methods
function userUploadDestination(req) {
  if (!fs.existsSync(resolvePath(config.Storage.UploadPath)))
    fs.mkdirSync(resolvePath(config.Storage.UploadPath));
  const destination = resolvePath(config.Storage.UploadPath, req.session.uuid);
  if (!fs.existsSync(destination)) fs.mkdirSync(destination);
  return destination;
}

function cancelUpload(path) {
  if (path != null && fs.existsSync(path)) fs.unlinkSync(path);
}

module.exports = {
  userUpload,
  cancelUpload,
};
