//Imports
const path = require("path");
const fs = require("fs");
//Local Imports
const ath = require("./athenuem.js");
const db = require("./database.js");
const pr = require("./prerender.js");
const { StatusCode, Storage } = require("../server-config.json");
const FILESIZE_MB = Math.pow(1024, 2);
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
//File Actions
exports.fileUpload = (req, res) => {
  ath.userUpload(req, res, (err) => {
    const status = ath.approveFile(req); //Ensure the file meets criteria
    if (!req.file || err) {
    }
    if (status.type == StatusCode.Success) {
      db.addFile(req.file.filename, req.session.user_id);
    }
    const storage = {
      used: db.getUserUsedStorageSpace(req.session.user_id),
      total: db.getUserStorageSize(req.session.user_id)* FILESIZE_MB,
    };
    res.json({ status, storage });

    //this.redirectTo(req, res, "upload");
  });
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
exports.getDownload = (req, res) => {
  const file = db.getFile(req.query.target);
  const filePath = path.resolve(Storage.UploadPath, file.owner, file.path);
  if (!fs.existsSync(filePath)) {
    this.setStatus(req, StatusCode.Error, "Could not find that file!");
    this.redirectTo(req, res, req.session.lastPage);
  } else {
    res.download(filePath);
  }
};
exports.deleteFile = (req, res) => {
  const deleted = db.deleteFile(req.query.target);
  const status = {
    type: deleted ? StatusCode.Success : StatusCode.Error,
    tag: deleted ? "File Succesfully Deleted!" : "Error Deleting File!",
  };
  this.setStatus(req, status.type, status.tag);
  this.redirectTo(req, res, req.session.lastPage);
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
