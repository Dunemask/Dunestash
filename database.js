const fs = require("fs");
const defaultImage = "/images/blank_user.svg";
const FILESIZE_MB = Math.pow(1024, 2);
const FILESIZE_GB = Math.pow(1024, 3);
const defaultStorageSize = 2;
const rimraf = require("rimraf");

const bcrypt = require("bcrypt"); // Hashing
const SALT_ROUNDS = 10;

const dugdbLocation = __dirname + "/src/dugdatabase.json";
const dugdbTempPath = __dirname + "/src/dugdatabase-tmp.json";
const ddb = require("./dugdb.js"); // Main Database Object

const adminConfig = {
  useAdmin: true,
  email: "abc@xyz.com",
  pwd: "password",
  username: "admin",
  storage: 999,
};

let dugdb;

let dbChanged = false;

exports.init = () => {
  dugdb = new ddb.Dugdb();
  if (fs.existsSync(dugdbLocation)) {
    dugdb.loadData(JSON.parse(fs.readFileSync(dugdbLocation)));
  } else {
    if (adminConfig.useAdmin) {
      const hash = bcrypt.hashSync(adminConfig.pwd, SALT_ROUNDS);
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
// User Creation
exports.createUser = function (username, password, email) {
  // Setus up new user
  if (this.userExists(username)) {
    console.log("Username already exists"); // should be checked in Server.js but this is extra
    return;
  }
  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  let u = dugdb.newUser(username, hash, email, defaultStorageSize);
  let uuid = dugdb.addUser(u);
  dbChanged = true;
  fs.mkdirSync(`${__dirname}/uploads/${uuid}`);
  return uuid;
};
exports.deleteUser = function (uuid) {
  // Removes user
  if (!this.userUuidExists(uuid)) return;
  dugdb.users[uuid].ownedFiles.forEach((file, i) => {
    this.deleteFile(file, uuid);
  });
  delete dugdb.users[uuid];
  rimraf.sync(__dirname + "uploads/" + uuid + "/");
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
exports.getUserObject = function (uuid) {
  // Returns an object holding much information about user
  return dugdb.users[uuid];
};
exports.getUserStorageSize = function (uuid) {
  // Storage Size
  if (!dugdb.users[uuid]) return;
  return parseInt(dugdb.users[uuid].storage) * FILESIZE_GB;
};
exports.getUserEmail = function (uuid) {
  // Email
  return dugdb.users[uuid] && dugdb.users[uuid].email;
};
exports.getUserImage = function (uuid) {
  // Returns path to user image
  let userImage = `/images/user-images/${uuid}`;
  if (!fs.existsSync(__dirname + "/www" + userImage) || uuid == undefined) {
    userImage = defaultImage;
  }
  return userImage;
};
exports.getTemporaryUserImage = function (uuid) {
  // Returns path to user image
  let userImage = `/images/user-images/${uuid}-tmp`;
  if (!fs.existsSync(__dirname + "/www" + userImage) || uuid == undefined) {
    userImage = defaultImage;
  }
  return userImage;
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
  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  dugdb.users[uuid].hash = hash;
  dbChanged = true;
  return true;
};
//Update Databases
exports.updateUserStorage = function (forceUpdate) {
  // creates file to store database
  if (dbChanged || forceUpdate) {
    if (!fs.existsSync(dugdbLocation)) {
      fs.writeFileSync(dugdbLocation, "");
      console.log("New DB file created at: " + dugdbLocation);
    }
    dbChanged = false;
    let jsonString = JSON.stringify(dugdb.getExportObject());
    if (!fs.existsSync(dugdbTempPath)) {
      fs.copyFileSync(dugdbLocation, dugdbTempPath, fs.constants.COPYFILE_EXCL);
    } else {
      console.error("TMP DATABASE FILE ALREADY EXISTS FOR SOME REASON...");
      return;
    }
    let doubleCheckSuccess = false;
    try {
      fs.unlinkSync(dugdbLocation);
      fs.writeFileSync(dugdbLocation, jsonString);
      doubleCheckSuccess = true;
    } catch (err) {
      console.error("ISSUE COPYING, REVERTING TO PREVIOUS VERSION");
      fs.copyFileSync(dugdbTempPath, dugdbLocation, fs.constants.COPYFILE_EXCL);
    }
    if (doubleCheckSuccess) {
      fs.unlinkSync(dugdbTempPath);
    }
  }
};
exports.updateAllStorage = function (forceUpdate) {
  // Updates all storage
  exports.updateUserStorage(forceUpdate);
};
//File Control
exports.authorizedToViewFile = function (target, id) {
  // is user authorized to view a file?
  if (!this.fileExists(target)) {
    return false;
  }

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
exports.addFile = function (file, owner) {
  // Adds file based on user and file path.
  let f = dugdb.newFile(owner, file);
  dugdb.addFile(f);
  dbChanged = true;
  return f.uuid;
};
exports.deleteFile = function (file) {
  // Deletes file from db, user, and groups...
  if (!dugdb.files[file]) {
    return false;
  }
  const fileInfo = exports.getFile(file);
  const id = fileInfo.owner;
  exports.removeShare(file, id);
  exports.removeGroupShare(file, id);
  dugdb.users[id].ownedFiles = dugdb.users[id].ownedFiles.filter(
    (item) => item !== file
  );
  let deletedProperly = false;
  try {
    fs.unlinkSync(`${__dirname}/uploads/${id}/${exports.getFile(file).path}`);
    dugdb.users[id].ownedFiles = dugdb.users[id].ownedFiles.filter(
      (item) => item !== file
    );
    delete dugdb.files[file];
    dbChanged = true;
    deletedProperly = true;
  } catch (err) {
    console.error(err);
  }

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

// NEED TO TEST OUT ALL FUNCTIONS AND THEN ADD SOME MORE WHEN I FEEL LIKE ITz
