//Module imports
const express = require("express");
const path = require("path");
const fs = require("fs");
//Local Imports & Configs
const db = require("../extensions/database");
const ath = require("../extensions/athenuem");
const { hasUuid } = require("./auth");
const { Storage } = require("../config.json");
//Establish path and create router
/** Absolute Router Path /api/stash*/
const router = express.Router();
//Routes
/**
 * Sends list of files to the client
 */
router.get("/files", hasUuid, (req, res) => {
  const ownedFiles = db.getOwnedFiles(req.session.user_id);
  let userFiles = new Array(ownedFiles.length);
  ownedFiles.forEach((fileUuid, index) => {
    userFiles[index] = db.getFile(fileUuid);
  });
  res.json(userFiles);
});
/**
 * Sends queried file to client
 */
router.get("/raw", hasUuid, (req, res) => {
  const file = db.getFile(req.query.target);
  const filePath = path.resolve(Storage.UploadPath, file.owner, file.path);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "File not found!" });
  } else {
    res.sendFile(filePath);
  }
});
/**
Sends Queried Download to client
*/
router.get("/download", hasUuid, (req, res) => {
  if (!req.query.target && !req.query.zipTarget) {
    res.status(400).json({ message: "No file(s) selected!" });
    return;
  }
  let zipFile, filePath;
  if (
    req.query.target &&
    db.authorizedToViewFile(req.query.target, req.session.user_id)
  ) {
    //If Single file and authorized to view, download
    const file = db.getFile(req.query.target);
    filePath = path.resolve(Storage.UploadPath, file.owner, file.path);
  } else if (
    req.query.zipTarget &&
    db.getZipFile(req.query.zipTarget).owner == req.session.user_id
  ) {
    filePath = path.resolve(Storage.DownloadZipPath, req.query.zipTarget);
    db.setZipExpire(
      req.query.zipTarget,
      Date.now() + parseInt(Storage.ZipDownloadExpire)
    );
  }
  //Send File
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: "File not found!" });
  } else {
    res.download(filePath);
  }
});
/** TODO
Creates a link for the user to be able to download single or multiple files
*/
router.post("/download", hasUuid, (req, res) => {
  if (!req.body || req.body.length === undefined) {
    res.status(400).json({ message: "No file(s) selected!" });
    return;
  }
  let needZip = req.body.length > 1;
  let authorized = true;
  for (let file of req.body) {
    authorized =
      authorized && db.authorizedToViewFile(file, req.session.user_id);
    if (!authorized) break;
  }
  let downloadUrl = absolutePath + "/download?";
  let downloadName;
  if (needZip) {
    downloadName = db.zipFiles(req.body, req.session.user_id);
    downloadUrl += `zipTarget=${downloadName}`;
  } else {
    downloadName = db.getFile(req.body[0]).path;
    downloadUrl += `target=${req.body[0]}`;
  }
  res.json({ downloadUrl, downloadName });
});
/**
Deletes Selected Files
*/
router.post("/delete", hasUuid, (req, res) => {
  if (!req.body || req.body.length === undefined) {
    res.status(400).json({ message: "No file(s) selected!" });
    return;
  }
  let failedFiles = [];
  let authorized;
  req.body.forEach((file) => {
    authorized = db.authorizedToEditFile(file, req.session.user_id);
    if (!authorized || !db.deleteFile(file)) failedFiles.push(file);
  });

  if (failedFiles.length > 0) {
    res
      .status(500)
      .json({ message: "Couldn't Delete Some Files", failedFiles });
  } else {
    res.sendStatus(200);
  }
});
/**
 * Uploads a single file with the user field: user-selected-file
 */
router.post("/upload", hasUuid, (req, res) => {
  const serverStorage = db.getUserStorageObject(req.session.user_id);
  const convertedTotal = serverStorage.total * Storage.UserStorageUnit;
  //If no headers then they didn't send the filesize, so we can't let them upload
  if (!req.headers || req.headers.filesize == undefined) {
    res.status(400).json({
      message: "Upload Size Not Specified!",
      storageUsed: serverStorage.used,
    });
    return;
  }

  //Test for if the file is going to be bigger than the server can hold.
  const fileBiggerThanServerStorage =
    parseInt(req.headers.filesize) > convertedTotal - serverStorage.used;
  if (fileBiggerThanServerStorage) {
    res.status(500).json({
      message: "Not enough Available Space!",
      storageUsed: serverStorage.used,
    });
    return;
  }
  //Attempt to upload the file
  let usedStorage = 0;
  let file;
  //Add the pending total to the session storage
  usedStorage = serverStorage.used + parseInt(req.headers.filesize);
  db.updateUserStorageObject(req.session.user_id, { used: usedStorage });
  ath.userUpload(req, res, (err) => {
    let status = {};
    if (!req.file || err || req.file.size != req.headers.filesize) {
      db.updateUserStorageObject(req.session.user_id, {
        used: serverStorage.used,
      });
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    //Add File
    file = db.getFile(
      db.addFile(
        req.session.user_id,
        req.file.filename,
        parseInt(req.headers.filesize)
      )
    );
    res.status(200).json({ file });
  });
});
module.exports = router;
