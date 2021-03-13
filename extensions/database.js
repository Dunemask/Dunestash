const fs = require("fs");
const rimraf = require("rimraf");
const bcrypt = require("bcrypt"); // Hashing
const AdmZip = require("adm-zip"); // Zipping
const { v4: uuidv4 } = require("uuid"); // Depends on uuid module
const path = require("path");
const { Storage, Web, Server } = require("../server-config.json");
const dugdblocation = path.resolve(Storage.DatabasePath);
const dugdbTempPath = path.resolve(Storage.DatabasePathTemporary);
const { Dugdb } = require("./dugdb.js"); // Main Database Object
const adminConfig = Server.AdminConfig;
let dugdb;
let dbChanged = false;
exports.init = () => {
  if (!fs.existsSync(path.resolve(Storage.UploadPath)))
    fs.mkdirSync(path.resolve(Storage.UploadPath));
  //Temporary Zip Paths
  /*if (fs.existsSync(path.resolve(Storage.DownloadZipPath))) {
    rimraf.sync(path.join(Storage.DownloadZipPath));
  }
  fs.mkdirSync(path.resolve(Storage.DownloadZipPath));*/
  //DB Load/Setup
  if (fs.existsSync(path.resolve(dugdblocation))) {
    dugdb = new Dugdb(require(path.resolve(dugdblocation)));
  } else {
    dugdb = new Dugdb();
    if (adminConfig.useAdmin) {
      const hash = bcrypt.hashSync(adminConfig.pwd, Server.SaltRounds);
      let admin = dugdb.newUser(
        adminConfig.username,
        hash,
        adminConfig.email,
        adminConfig.storage
      );
      dugdb.addUser(admin);
    }
  }
};
exports.resourceExists = (path) => {
  return fs.existsSync(path);
};
//Zip Actions
exports.addZip = (target, owner) => {
  dbChanged = true;
  dugdb.zips[target] = {};
  dugdb.zips[target].owner = owner;
  dugdb.zips[target].expires = Date.now() + parseInt(Storage.ZipClickExpire);
  return dugdb.zips[target];
};
exports.deleteZip = (target) => {
  dbChanged = true;

  try {
    delete dugdb.zips[target];
    fs.unlinkSync(path.resolve(Storage.DownloadZipPath, target));
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};
exports.setZipExpire = (target, time) => {
  if (!dugdb.zips[target]) return;
  dugdb.zips[target].expires = parseInt(time);
};
exports.zipFiles = (files, id) => {
  const name = `${uuidv4()}.zip`;
  const filePath = path.resolve(Storage.DownloadZipPath, name);
  let zip = new AdmZip();
  //Create zip path if it doesn't exist
  if (!fs.existsSync(path.resolve(Storage.DownloadZipPath)))
    fs.mkdirSync(path.resolve(Storage.DownloadZipPath));
  //Add each file to the zip archive;
  files.forEach((file) => {
    let f = this.getFile(file);
    zip.addLocalFile(path.resolve(Storage.UploadPath, f.owner, f.path));
  });
  //Create After so the autoremoval doesn't remove it before it's written
  zip.writeZip(filePath);
  this.addZip(name, id);
  return name;
};
exports.getZipFile = (target) => {
  const filePath = path.resolve(Storage.DownloadZipPath, target);
  if (!fs.existsSync(filePath) || !dugdb.zips[target]) return false;
  return dugdb.zips[target];
};
// User Creation
exports.createUser = function (username, password, email) {
  // Setus up new user
  if (this.userExists(username)) {
    console.log("Username already exists"); // should be checked in Server.js but this is extra
    return;
  }
  const hash = bcrypt.hashSync(password, Server.SaltRounds);
  let u = dugdb.newUser(username, hash, email, Storage.UserStorageSize);
  let uuid = dugdb.addUser(u);
  dbChanged = true;
  fs.mkdirSync(path.resolve(Storage.UploadPath, uuid));
  return uuid;
};
exports.deleteUser = function (uuid) {
  // Removes user
  if (!this.userUuidExists(uuid)) return;
  dugdb.users[uuid].ownedFiles.forEach((file, i) => {
    this.deleteFile(file, uuid);
  });
  delete dugdb.users[uuid];
  rimraf.sync(path.join(Storage.UploadPath, uuid));
  return true;
  dbChanged = true;
};
// User Data
exports.getUuid = function (username) {
  // Returns user uuid by searching username
  let uid;
  for (key in dugdb.users) {
    let u = dugdb.users[key].username;
    if (u.toLowerCase() == username.toLowerCase()) {
      uid = key;
      break;
    }
  }
  return uid;
};
exports.userExists = (username) => {
  return !!this.getUuid(username);
};
exports.userUuidExists = (uuid) => {
  return !!dugdb.users[uuid];
};
exports.getUser = function (uuid) {
  // Returns username, misnomer call it getUsername()
  return dugdb.users[uuid] && dugdb.users[uuid].username;
};
exports.getUserImage = function (uuid) {
  if (!!uuid && fs.existsSync(path.join(Storage.UserImagePath, uuid)))
    return `${Web.ProfileImage}${uuid}`;
  else return Web.ProfileImageDefault;
};
exports.getTemporaryUserImage = function (uuid) {
  if (
    !!uuid &&
    fs.existsSync(path.join(Storage.UserImagePathTemporary, `${uuid}-tmp`))
  )
    return `${Web.ProfileImageTemporary}${uuid}-tmp`;
  else return this.getUserImage(uuid);
};
exports.getUserObject = function (uuid) {
  // Returns an object holding much information about user
  return dugdb.users[uuid];
};
exports.getUserEmail = function (uuid) {
  // Email
  return dugdb.users[uuid] && dugdb.users[uuid].email;
};
exports.getUserGroups = function (uuid) {
  // Returns list of group objects
  let userGroups = [];
  if (!dugdb.users[uuid]) return userGroups;
  for (gid in dugdb.users[uuid].groups) {
    userGroups.push(dugdb.getGroup(dugdb.users[uuid].groups[gid]));
  }
  return userGroups;
};
exports.getUserGroupPermission = function (uuid, gid) {
  // Returns the permission the user has in the group
  /*if(dugdb.groups[gid].owner = uuid) {
        return "manager";
    }*/
  let d = dugdb.groups[gid].users.filter((s) => {
    return s.user == uuid;
  });
  if (d.length == 0) {
    return false;
  }
  return d[0].perm;
};
exports.validateCredentials = function (user, pass) {
  // username & password validation
  let validUser = false;
  if (!user) return false;
  let uuid = this.getUuid(user);
  if (uuid != undefined && pass != undefined) {
    validUser = bcrypt.compareSync(pass, dugdb.users[uuid].hash);
  }
  return validUser;
};
exports.validateCredentialsOnUuid = function (uuid, pass) {
  // uuid & password validation
  let validUser = false;
  if (uuid != undefined && pass != undefined) {
    validUser = bcrypt.compareSync(pass, dugdb.users[uuid].hash);
  }
  return validUser;
};
exports.changeUsername = function (uuid, username) {
  // change username by uuid, accounts for all usernames in db
  const usernameTaken = this.userExists(username);
  if (!usernameTaken) {
    dugdb.users[uuid].username = username;
    dbChanged = true;
  }
  return !usernameTaken;
};
exports.changePassword = function (uuid, password) {
  // change password by uuid
  if (!this.userUuidExists(uuid)) return;
  const hash = bcrypt.hashSync(password, Server.SaltRounds);
  dugdb.users[uuid].hash = hash;
  dbChanged = true;
  return true;
};
//File Storage
exports.getUserStorageObject = function (uuid) {
  if (!uuid) return;
  return dugdb.users[uuid].storage;
};
exports.updateUserStorageObject = function (uuid, { total, used }) {
  if (!uuid) return;
  dugdb.users[uuid].storage = {
    total: total ?? dugdb.users[uuid].storage.total,
    used: used ?? dugdb.users[uuid].storage.used,
  };
  dbChanged = true;
};
//Update Databases
exports.updateUserStorage = function (forceUpdate) {
  // creates file to store database
  if (dbChanged || forceUpdate) {
    if (!fs.existsSync(path.resolve(dugdblocation))) {
      fs.writeFileSync(path.resolve(dugdblocation), "");
      console.log("New DB file created at: " + path.resolve(dugdblocation));
    }
    dbChanged = false;
    let jsonString = JSON.stringify(dugdb.getExportObject());
    if (!fs.existsSync(path.resolve(dugdbTempPath))) {
      fs.copyFileSync(
        path.resolve(dugdblocation),
        path.resolve(dugdbTempPath),
        fs.constants.COPYFILE_EXCL
      );
    } else {
      console.error("TMP DATABASE FILE ALREADY EXISTS FOR SOME REASON...");
      return;
    }
    let doubleCheckSuccess = false;
    try {
      fs.unlinkSync(path.resolve(dugdblocation));
      fs.writeFileSync(path.resolve(dugdblocation), jsonString);
      doubleCheckSuccess = true;
    } catch (err) {
      console.error("ISSUE COPYING, REVERTING TO PREVIOUS VERSION");
      fs.copyFileSync(
        path.resolve(dugdbTempPath),
        path.resolve(dugdblocation),
        fs.constants.COPYFILE_EXCL
      );
    }
    if (doubleCheckSuccess) {
      fs.unlinkSync(path.resolve(dugdbTempPath));
    }
  }
};
exports.updateAllStorage = function (forceUpdate) {
  // Updates all storage
  exports.updateUserStorage(forceUpdate);
};
exports.zipAutoRemoval = function () {
  const compareDate = Date.now();
  for (let zip in dugdb.zips) {
    if (dugdb.zips[zip].expires <= compareDate) {
      this.deleteZip(zip);
    }
  }
};
//File Control
exports.authorizedToViewFile = function (target, id) {
  // is user authorized to view a file?
  if (!this.fileExists(target)) return false;

  if (dugdb.files[target].isPublic) return true;

  if (dugdb.files[target].owner == id) {
    return true;
  } else if (
    dugdb.files[target].viewList.includes(id) ||
    dugdb.files[target].editList.includes(id)
  ) {
    return true;
  } else {
    for (i in dugdb.users[id].groups) {
      let grp = dugdb.groups[dugdb.users[id].groups[i]];
      if (grp.viewFiles.includes(target) || grp.editFiles.includes(target)) {
        return true;
      }
    }
    return false;
  }
};
exports.authorizedToEditFile = function (target, id) {
  // is user authorized to edit file?
  if (!this.fileExists(target)) {
    return false;
  }
  if (dugdb.files[target].owner == id) {
    return true;
  } else if (dugdb.files[target].editList.includes(id)) {
    return true;
  } else {
    for (i in dugdb.users[id].groups) {
      let grp = dugdb.groups[dugdb.users[id].groups[i]];
      if (grp.editFiles.includes(target)) {
        let d = grp.users.filter((s) => {
          return s.user == id;
        });
        if (d[0].perm != "viewer") {
          return true;
        }
      }
    }
    return false;
  }
};
exports.getSharedFiles = function (id) {
  // Returns list of file IDs that is shared to the user
  if (!dugdb.users[id]) {
    return;
  }
  return dugdb.users[id].sharedFiles;
};
exports.getOwnedFiles = function (id) {
  // Returns list of file IDs that is owned by the user
  if (!dugdb.users[id]) {
    return;
  }
  return dugdb.users[id].ownedFiles;
};
exports.getGroupFiles = function (gid, id) {
  // Returns a list of files that user has access via group (both view and edit)
  if (!dugdb.groups[gid]) return;
  if (!users.groups.includes(id)) return;
  let groupFiles = [];
  for (i in dugdb.groups[gid].editFiles) {
    groupFiles.push(i);
  }
  for (i in dugdb.groups[gid].viewFiles) {
    groupFiles.push(i);
  }
  return groupFiles;
};
// File mutation
exports.addFile = function (owner, fileName, fileSize) {
  // Adds file based on user and file path.
  // Adding File Size is taken care of by athenuem.js
  const f = dugdb.newFile(owner, fileName, fileSize);
  dugdb.addFile(f);
  dbChanged = true;
  return f.uuid;
};
exports.deleteFile = function (file) {
  // Deletes file from db, user, and groups...
  if (!dugdb.files[file]) {
    return false;
  }
  const fileInfo = this.getFile(file);
  const id = fileInfo.owner;
  exports.removeShare(file, id);
  exports.removeGroupShare(file, id);
  dbChanged = true;
  let deletedProperly = false;
  try {
    fs.unlinkSync(path.join(Storage.UploadPath, id, this.getFile(file).path));
    deletedProperly = true;
  } catch (err) {
    console.error(err);
  }
  dugdb.users[id].ownedFiles = dugdb.users[id].ownedFiles.filter(
    (item) => item !== file
  );
  const serverStorage = this.getUserStorageObject(id);
  this.updateUserStorageObject(id, {
    used: serverStorage.used - this.getFileSize(file),
  });
  delete dugdb.files[file];
  return deletedProperly;
};
exports.fileExists = function (file) {
  // Adds file based on user and file path.
  return !!dugdb.files[file];
};
exports.getFile = function (file) {
  // Returns file object from uuid
  return dugdb.files[file];
};
exports.getFilePath = function (file) {
  // Returns file object from uuid
  return dugdb.files[file] && dugdb.files[file].path;
};
exports.getFileSize = function (file) {
  return dugdb.files[file] && dugdb.files[file].size;
};
exports.getFileOwnerUsername = function (file) {
  // Returns username of owner
  return dugdb.users[dugdb.files[file].owner].username;
};
// User to user sharing
exports.shareFile = function (file, options, uuid) {
  // Shares a file to a uuid
  // Current options: {edit:boolean}
  // Also used to change the share options between user
  this.removeSharedUser(file, uuid);

  if (options.edit == true) {
    dugdb.files[file].editList.push(uuid);
    dugdb.files[file].viewList = dugdb.files[file].viewList.filter(
      (item) => item !== uuid
    );
  } else {
    dugdb.files[file].viewList.push(uuid);
    dugdb.files[file].editList = dugdb.files[file].editList.filter(
      (item) => item !== uuid
    );
  }
  dugdb.users[uuid].sharedFiles.push(file);
  dbChanged = true;
  return true;
};
exports.removeShare = function (file) {
  // Unshares a file with everyone except for the owner
  if (!this.fileExists(file)) {
    return;
  }
  for (i in dugdb.files[file].viewList) {
    let uuid = dugdb.files[file].viewList;
    dugdb.users[uuid].sharedFiles = dugdb.users[uuid].sharedFiles.filter(
      (item) => item !== file
    );
  }
  for (i in dugdb.files[file].editList) {
    let uuid = dugdb.files[file].editList;
    dugdb.users[uuid].sharedFiles = dugdb.users[uuid].sharedFiles.filter(
      (item) => item !== file
    );
  }
  dugdb.files[file].viewList = [];
  dugdb.files[file].editList = [];
  dgChanged = true;
};
exports.removeSharedUser = function (file, user) {
  // Unshares a file with a specific user
  if (!this.fileExists(file) || !this.userUuidExists(user)) {
    return;
  }
  dugdb.files[file].viewList = dugdb.files[file].viewList.filter(
    (item) => item !== user
  );
  dugdb.files[file].editList = dugdb.files[file].editList.filter(
    (item) => item !== user
  );
  dugdb.users[user].sharedFiles = dugdb.users[user].sharedFiles.filter(
    (item) => item !== file
  );
  dbChanged = true;
};
exports.getSharedInformation = function (file) {
  // Returns a list of users who can access the file
  if (!dugdb.files[file]) {
    return;
  }
  let obj = { edit: [], view: [] };
  for (i in dugdb.files[file].editList) {
    let uuid = dugdb.files[file].editList[i];
    let name = dugdb.getUser(uuid).username;
    obj.edit.push({ id: uuid, name: name });
  }
  for (i in dugdb.files[file].viewList) {
    let uuid = dugdb.files[file].viewList[i];
    let name = dugdb.getUser(uuid).username;
    obj.view.push({ id: uuid, name: name });
  }
  return obj;
};
// Group Creation
exports.createGroup = function (uuid, name) {
  // Creates a group
  let g = dugdb.newGroup(uuid, name);
  dugdb.addGroup(g);
  dbChanged = true;
  return g.uuid;
};
exports.groupExists = (gid) => {
  return !!dugdb.groups[gid];
};
exports.groupNameEdit = function (name, gid) {
  // changes the name of a group by gid
  dugdb.groups[gid].name = name;
  dbChanged = true;
  return true;
};
exports.getGroupName = function (gid) {
  // Returns name of group
  return dugdb.groups[gid].name;
};
exports.getGroupById = function (gid) {
  // Returns group
  return dugdb.groups[gid];
};
exports.getGroupUsers = function (gid) {
  // Returns names & Permissions
  let obj = [];
  for (i in dugdb.groups[gid].users) {
    let usrobj = dugdb.groups[gid].users[i];
    obj.push({
      id: usrobj.user,
      perm: usrobj.perm,
      username: dugdb.getUser(usrobj.user).username,
    });
  }
  return obj;
};
exports.getGroupOwner = function (gid) {
  // Returns owner of group
  return dugdb.groups[gid].owner;
};
exports.getGroupFiles = function (gid) {
  // Returns files in a group
  let obj = {
    viewFiles: dugdb.groups[gid].viewFiles,
    editFiles: dugdb.groups[gid].editFiles,
  };
  return obj;
};
exports.addUserToGroup = (user, group, perm) => {
  // adds a user to a group with permissions
  // Permissions are "viewer", "member", or "manager"
  dugdb.addUserToGroup(user, group, perm);
  dbChanged = true;
  return true;
};
exports.removeUserFromGroup = (user, gid) => {
  // adds a user to a group with permissions
  dugdb.groups[gid].users = dugdb.groups[gid].users.filter(
    (item) => item.user !== user
  );
  dugdb.users[user].groups = dugdb.users[user].groups.filter(
    (item) => item !== gid
  );
  dbChanged = true;
  return true;
};
exports.shareGroupFile = function (file, options, gid) {
  // adds file to group with viewership
  // Current options: {edit:boolean}
  if (options.edit) {
    dugdb.groups[gid].viewFiles = dugdb.groups[gid].viewFiles.filter(
      (item) => item !== file
    );
    dugdb.groups[gid].editFiles.push(file);
  } else {
    dugdb.groups[gid].editFiles = dugdb.groups[gid].editFiles.filter(
      (item) => item !== file
    );
    dugdb.groups[gid].viewFiles.push(file);
  }
  dugdb.files[file].groups[gid] = true;
  dbChanged = true;
  return true;
};
exports.removeGroupFile = function (file, gid) {
  // removes file from group
  dugdb.groups[gid].viewFiles = dugdb.groups[gid].viewFiles.filter(
    (item) => item !== file
  );
  dugdb.groups[gid].editFiles = dugdb.groups[gid].editFiles.filter(
    (item) => item !== file
  );
  dugdb.files[file].groups = dugdb.files[file].groups.filter(
    (item) => item !== gid
  );
  dbChanged = true;
  return true;
};
exports.removeGroupShare = function (file) {
  // Unshares a file with everyone in every group
  if (!dugdb.files[file]) {
    return;
  }
  for (i in dugdb.files[file].groups) {
    this.removeGroupFile(file, i);
  }
  dugdb.files[file].groups = {};
  return true;
};
exports.getDDB = () => {
  // shouldn't be used, only for testing/seeing what's wrong
  return dugdb;
};
