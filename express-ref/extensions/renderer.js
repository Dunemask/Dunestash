//Imports
const path = require("path");
const fs = require("fs");
const multer = require("multer");
//Local Imports
const ath = require("./athenuem.js");
const db = require("./database.js");
const pr = require("./prerender.js");
const { StatusCode, Storage } = require("../server-config.json");
//Load Page Renders the file with the status and props.
exports.setStatus = (req, type, tag) => {
  if (!req.session.status) req.session.status = {};
  if (type) req.session.status.type = type;
  if (tag) req.session.status.tag = tag;
};
exports.loadPage = (req, res, location, displayProps) => {
  if (!req || !res) throw new Error("Must Be Accessed Via Express Server!");
  if (!location) throw new Error("Location Cannot Be Empty!");
  //Save the Status Before deleting it;
  const uuid = req.session.user_id;
  const status = req.session.status;
  req.session.status = {};
  req.session.lastPage = req.originalUrl;
  //Render Page
  res.render(location, {
    uuid,
    status,
    ...displayProps,
  });
};
//Normal Pages With 'Advanced' Props
exports.filesPage = (req, res) => {
  let linkedMode = req.query.type == "linked";
  let filePrerender = pr.filesPageRender(req.session.user_id, linkedMode);
  this.loadPage(req, res, "pages/Files.jsx", {
    displayFiles: filePrerender.displayFiles,
    linkedMode,
  });
};
exports.sharePage = (req, res) => {
  let groups = db.getUserGroups(req.session.user_id);
  let displayFile = pr.sharePageRender(req.query.target);
  this.loadPage(req, res, "pages/Share.jsx", { groups, displayFile });
};
//File Downloads
exports.multiDownload = (req, res) => {
  if (!req.body || req.body.length === undefined) {
    this.setStatus(req, StatusCode.Error, "No Files Specified");
    res.json({ status: req.session.status });
    return;
  }
  let needZip = req.body.length > 1;
  let authorized = true;
  for (let file of req.body) {
    authorized =
      authorized && db.authorizedToViewFile(file, req.session.user_id);
    if (!authorized) break;
  }
  let downloadUrl = "download?";
  if (needZip) {
    const zipName = db.zipFiles(req.body, req.session.user_id);
    downloadUrl += `zipTarget=${zipName}`;
  } else {
    downloadUrl += `target=${req.body[0]}`;
  }
  res.json({ downloadUrl });
};
exports.getDownload = (req, res) => {
  if (!req.query.target && !req.query.zipTarget) {
    this.setStatus(req, StatusCode.Error, "No Target Specified");
    res.json({ status: req.session.status });
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

  if (!fs.existsSync(filePath)) {
    this.setStatus(req, StatusCode.Error, "Could not find that file!");
    this.redirectTo(req, res, req.session.lastPage);
  } else {
    res.download(filePath);
  }
};
exports.deleteFiles = (req, res) => {
  if (!req.body || req.body.length === undefined) {
    this.setStatus(req, StatusCode.Error, "No Files Specified");
    res.json({ status: req.session.status });
    return;
  }
  let failedFiles = [];
  let authorized;
  req.body.forEach((file) => {
    authorized = db.authorizedToEditFile(file, req.session.user_id);
    if (!authorized || !db.deleteFile(file)) failedFiles.push(file);
  });
  if (failedFiles.length > 0) {
    this.setStatus(req, StatusCode.Error, "Couldn't Delete Some Files");
    res.json({ status: req.session.status, failedFiles });
  } else {
    this.setStatus(req, StatusCode.Success, "Files Deleted Successfully");
    res.json({ status: req.session.status });
  }
};
//File Actions
exports.fileUpload = (req, res) => {
  const serverStorage = db.getUserStorageObject(req.session.user_id);
  const convertedTotal = serverStorage.total * Storage.UserStorageUnit;
  //If no headers then they didn't send the filesize, so we can't let them upload
  if (!req.headers || req.headers.filesize == undefined) {
    res.json({
      status: {
        type: "Error",
        tag: "Upload has been tampered with!",
      },
      storageUsed: serverStorage.used,
    });
    return;
  }
  //Test for if the file is going to be bigger than the server can hold.
  const fileBiggerThanServerStorage =
    parseInt(req.headers.filesize) > convertedTotal - serverStorage.used;
  if (fileBiggerThanServerStorage) {
    res.json({
      status: {
        type: "Error",
        tag: "Not Enough Available Space!",
      },
      storageUsed: serverStorage.used,
    });
    //Attempt to upload the file
  } else {
    let usedStorage = 0;
    let file;
    //Add the pending total to the session storage
    usedStorage = serverStorage.used + parseInt(req.headers.filesize);
    db.updateUserStorageObject(req.session.user_id, { used: usedStorage });
    ath.userUpload(req, res, (err) => {
      let status = {};
      if (!req.file || err || req.file.size != req.headers.filesize) {
        status = { type: StatusCode.Error, tag: "Internal Error Occurred!" };
        db.updateUserStorageObject(req.session.user_id, {
          used: serverStorage.used,
        });
      } else {
        //Add File
        file = db.getFile(
          db.addFile(
            req.session.user_id,
            req.file.filename,
            parseInt(req.headers.filesize)
          )
        );
        status = {
          type: StatusCode.Success,
          tag: "Upload Successful!",
        };
      }
      res.json({
        status,
        storageUsed: usedStorage,
        file,
      });
    });
  }
};
exports.getRawData = (req, res) => {
  const file = db.getFile(req.query.target);
  const filePath = path.resolve(Storage.UploadPath, file.owner, file.path);
  if (!fs.existsSync(filePath)) {
    this.setStatus(req, StatusCode.Error, "Could not find that file!");
    this.redirectTo(req, res, req.session.lastPage);
  } else {
    res.sendFile(filePath);
  }
};
//Login Events
exports.register = (req, res) => {
  let status = {};
  if (
    req.body.username == undefined ||
    req.body.password == undefined ||
    req.body["confirm-password"] == undefined
  ) {
    status.type = StatusCode.Error;
    status.tag = "Error: 1 or More Fields Empty!";
  } else if (!!db.getUuid(req.body.username)) {
    status.type = StatusCode.Error;
    status.tag = "Username Already Taken!";
  } else if (req.body["confirm-password"] != req.body.password) {
    status.type = StatusCode.Error;
    status.tag = "Passwords Don't Match!";
  } else if (req.body["confirm-password"] == req.body.password) {
    db.createUser(req.body.username, req.body.password);
    status.type = StatusCode.Success;
    status.tag = "Account Successfully Created!";
  } else {
    status.type = StatusCode.Error;
    status.tag = "Unknown Error Occurred!";
  }
  this.setStatus(req, status.type, status.tag);
  if (status.type == StatusCode.Error) {
    this.redirectTo(req, res, "register");
  } else {
    this.redirectTo(req, res, req.session.returnTo);
  }
};
exports.checkLogin = (req, res) => {
  let status = {};
  let username = req.body.username;
  let password = req.body.password;
  let isValid = db.validateCredentials(username, password);
  let returnTo = req.session.returnTo ? req.session.returnTo : "/";
  if (isValid) {
    req.session.user_id = db.getUuid(username);
    status.type = StatusCode.Success;
    status.tag = "Successfully Logged In!";
    this.setStatus(req, status.type, status.tag);
    this.redirectTo(req, res, req.session.returnTo);
  } else {
    status.type = StatusCode.Error;
    status.tag = "Credentials Incorrect!";
    this.setStatus(req, status.type, status.tag);
    this.redirectTo(req, res, "login");
  }
};
exports.userLogout = (req, res) => {
  delete req.session.user_id;
  this.redirectTo(req, res, req.session.lastPage);
};
// Profile Scripts
// Updates user information from the profile page, called by app.get("/profile")
exports.profileApplyUpdate = (req, res) => {
  let status = {};
  let username = db.getUser(req.session.user_id);
  const clientUsername = req.body["username-entry"];
  const uuid = req.session.user_id;
  const tmpImage = path.resolve(Storage.UserImagePathTemporary, `${uuid}-tmp`);
  const image = path.resolve(Storage.UserImagePath, uuid);
  if (fs.existsSync(tmpImage)) {
    if (fs.existsSync(image)) fs.unlinkSync(image);
    fs.renameSync(tmpImage, image);
    status.tag = "Changes Saved!";
    status.type = StatusCode.Success;
  }
  if (username.toLowerCase() != clientUsername.toLowerCase()) {
    let newUsername = clientUsername;
    newUsername = newUsername.charAt(0).toUpperCase() + newUsername.slice(1);
    let usernameTaken = db.changeUsername(req.session.user_id, newUsername);
    if (!usernameTaken) {
      status.tag = "Changes Saved!";
      status.type = StatusCode.Success;
    } else {
      status.tag == "Username Taken!";
      status.type = StatusCode.Error;
    }
  } else {
    status.tag = "Changes Saved";
    status.type = StatusCode.Success;
  }
  this.setStatus(req, status.type, status.tag);
  this.redirectTo(req, res, "profile");
};
exports.profileImageUpdate = (req, res) => {
  ath.imageUpload(req, res, (err) => {
    let status = {};
    if (err || req.file == undefined) {
      status.type = StatusCode.Error;
      status.tag = "Internal Error!";
    }
    if (req.fileValidationError) {
      status.tag = "Only jpeg and png image types are accepted";
    }
    this.setStatus(req, status.type, status.tag);
    this.loadPage(req, res, "pages/Profile.jsx", {
      userImage: db.getTemporaryUserImage(req.session.user_id),
    });
  });
};
exports.profilePasswordUpdate = (req, res) => {
  let status = {};
  if (
    db.validateCredentialsOnUuid(
      req.session.user_id,
      req.body["original-password"]
    )
  ) {
    if (req.body["new-password"] == req.body["confirm-new-password"]) {
      db.changePassword(req.session.user_id, req.body["new-password"]);
      status.tag = "Password Changed";
      status.type = StatusCode.Success;
    } else {
      status.tag = "Passwords Don't Match";
      status.type = StatusCode.Error;
    }
  } else {
    status.tag = "Original Password Incorrect";
    status.type = StatusCode.Error;
  }
  this.setStatus(req, status.type, status.tag);
  this.redirectTo(req, res, "profile?type=password");
};
exports.profileUpdateError = (req, res) => {
  const status = {
    type: StatusCode.Error,
    tag: "Could not update your information.",
  };
  this.setStatus(req, status.type, status.tag);
  r.redirect(req.session.lastPage);
};
//Share Scripts
exports.shareUsingNames = (req, res) => {
  let status = {};
  let unames = req.body["user-share-field"].replaceAll(" ", "").split(",");
  let uuid,
    shareFailed = false;
  for (const username of unames) {
    uuid = db.getUuid(username);
    if (uuid == undefined) {
      shareFailed = true;
    }
    if (shareFailed || !db.shareFile(req.body.file, req.body.options, uuid)) {
      shareFailed = true;
      break;
    }
  }
  if (shareFailed) {
    status.type = StatusCode.Error;
    status.tag = "Error Sharing Requested File";
  } else {
    status.type = StatusCode.Success;
    status.tag = "File has been successfully shared!";
  }
  this.setStatus(req, status.type, status.tag);
  this.redirectTo(req, res, originalUrl);
};
//System Scripts
exports.notAuthorized = (req, res, link) => {
  const status = {
    type: StatusCode.Error,
    tag: "No Access Rights!",
  };
  this.setStatus(req, status.type, status.tag);
  this.redirectTo(req, res, link || req.originalUrl);
};
exports.redirectTo = (req, res, link) => {
  let redirect = req.query.next;
  if (redirect) {
    res.redirect(redirect);
  } else {
    res.redirect(link || "/");
  }
};
