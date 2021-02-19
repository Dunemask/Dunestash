const fs = require("fs");
const defaultImage = "/files/images/blank_user.svg";
const FILESIZE_MB = Math.pow(1024, 2);
const FILESIZE_GB = Math.pow(1024, 3);
const defaultStorageSize = 2;
const rimraf = require("rimraf");
const databaseLocation = __dirname + "/src/database.json";
const nemoLocation = __dirname + "/src/nemo.json";
let usersCont;
let nemo;
if (!fs.existsSync(databaseLocation)) {
  let dbcont = {
    users: {
      "0": {
        username: "admin",
        password: "password",
        storage: 1000,
      },
    },
  };
  let data = JSON.stringify(dbcont, null, 1);
  fs.writeFileSync(databaseLocation, data);
  usersCont = dbcont["users"];
} else {
  usersCont = JSON.parse(fs.readFileSync(databaseLocation))["users"];
}
if (!fs.existsSync(nemoLocation)) {
  nemo = { files: {}, groups: {} };
  let data = JSON.stringify({ nemo }, null, 1);
  fs.writeFileSync(nemoLocation, data);
} else {
  nemo = JSON.parse(fs.readFileSync(nemoLocation))["nemo"];
}
let userStorageChanged = false;
let nemoStorageChanged = false;
//UserData
exports.getUuid = function (user) {
  let uid;
  for (key in usersCont) {
    let u = usersCont[key]["username"];
    if (u.toLowerCase() == user) {
      uid = key;
      break;
    }
  }
  return uid;
};
exports.getUser = function (uuid) {
  return usersCont[uuid]["username"];
};
exports.getUserStorageSize = function (uuid) {
  return parseInt(usersCont[uuid]["storage"]) * FILESIZE_GB;
};
exports.getUserImage = function (uuid) {
  let userImage = `/files/images/user-images/${uuid}`;
  if (!fs.existsSync(__dirname + "/www" + userImage) || uuid == undefined) {
    userImage = defaultImage;
  }
  return userImage;
};
exports.getTemporaryUserImage = function (uuid) {
  let userImage = `/files/images/user-images/${uuid}`;
  if (fs.existsSync(__dirname + "/www" + userImage + "-tmp")) {
    return `/files/images/user-images/${uuid}-tmp`;
  } else {
    return exports.getUserImage(uuid);
  }
};
exports.removeTemporaryUserImage = function (uuid) {
  let userImage = __dirname + `/www/files/images/user-images/${uuid}`;
  let userImageTmp = userImage + "-tmp";
  if (fs.existsSync(userImageTmp)) {
    fs.unlinkSync(userImageTmp);
    return true;
  }
  return false;
};
exports.getUserGroups = function (uuid) {
  return usersCont[uuid]["groups"];
};
exports.validateCredentials = function (user, pass) {
  let working = false;
  if (!user) return false;
  let uuid = this.getUuid(user.toLowerCase());
  if (uuid != undefined && pass != undefined) {
    if (usersCont[uuid]["password"] == pass) {
      working = true;
    }
  }
  return working;
};
exports.validateCredentialsOnUuid = function (uuid, pass) {
  let working = false;
  if (uuid != undefined && pass != undefined) {
    if (usersCont[uuid]["password"] == pass) {
      working = true;
    }
  }
  return working;
};
exports.changeUsername = function (uuid, username) {
  let usernameTaken = false;
  for (key in usersCont) {
    if (usersCont[key]["username"] == username) {
      usernameTaken = true;
      break;
    }
  }
  if (!usernameTaken) {
    usersCont[uuid]["username"] = username;
    userStorageChanged = true;
  }
  return usernameTaken;
};
exports.changePassword = function (uuid, password) {
  usersCont[uuid]["password"] = password;
  userStorageChanged = true;
  return;
};
exports.groupEditFriendly = function (name, gid, uuid) {
  if (!usersCont[uuid]["groups"]) {
    usersCont[uuid]["groups"] = {};
  }
  usersCont[uuid]["groups"][gid] = name;
  userStorageChanged = true;
};
//Update Databases
exports.updateUserStorage = function (forceUpdate) {
  if (userStorageChanged || forceUpdate) {
    userStorageChanged = false;
    let data = JSON.stringify({ users: usersCont }, null, 1);
    let jsonPath = databaseLocation;
    let jsonTempPath = __dirname + "/src/database-tmp.json";
    //If The temp Exists, explode, IT SHOULD NOT EXIST
    if (!fs.existsSync(jsonTempPath)) {
      fs.copyFileSync(jsonPath, jsonTempPath, fs.constants.COPYFILE_EXCL);
    } else {
      console.error("MEGA ISSUE DO NOT RUN NEXT CODE!");
      return;
    }
    let doubleCheckSuccess = false;
    try {
      fs.unlinkSync(jsonPath);
      fs.writeFileSync(jsonPath, data);
      doubleCheckSuccess = true;
    } catch (err) {
      console.error("ISSUE COPYING, REVERTING TO PREVIOUS VERSION");
      fs.copyFileSync(jsonTempPath, jsonPath, fs.constants.COPYFILE_EXCL);
    }
    if (doubleCheckSuccess) {
      fs.unlinkSync(jsonTempPath);
    }
  }
};
exports.updateNemoStorage = function (forceUpdate) {
  if (nemoStorageChanged || forceUpdate) {
    nemoStorageChanged = false;
    let data = JSON.stringify({ nemo }, null, 1);
    let jsonPath = nemoLocation;
    let jsonTempPath = __dirname + "/src/nemo-tmp.json";
    //If The temp Exists, explode, IT SHOULD NOT EXIST
    if (!fs.existsSync(jsonTempPath)) {
      fs.copyFileSync(jsonPath, jsonTempPath, fs.constants.COPYFILE_EXCL);
    } else {
      console.error("MEGA ISSUE DO NOT RUN NEXT CODE!");
      return;
    }
    let doubleCheckSuccess = false;
    try {
      fs.unlinkSync(jsonPath);
      fs.writeFileSync(jsonPath, data);
      doubleCheckSuccess = true;
    } catch (err) {
      console.error("ISSUE COPYING, REVERTING TO PREVIOUS VERSION");
      fs.copyFileSync(jsonTempPath, jsonPath, fs.constants.COPYFILE_EXCL);
    }
    if (doubleCheckSuccess) {
      fs.unlinkSync(jsonTempPath);
    }
  }
};
exports.updateAllStorage = function (forceUpdate) {
  exports.updateUserStorage(forceUpdate);
  exports.updateNemoStorage(forceUpdate);
};
//Groups and File Control
exports.authorizedToViewFile = function (targetUser, target, id) {
  if (targetUser == id) {
    return true;
  } else if (!nemo.files[targetUser]) {
    return false;
  } else if (
    !nemo.files[targetUser]["owned"][target]["edit"] &&
    !nemo.files[targetUser]["owned"][target]["view"]
  ) {
    return false;
  } else if (nemo.files[targetUser]["owned"][target]["view"].includes(id)) {
    console.log("THIS ONE");
    return true;
  } else {
    return nemo.files[targetUser]["owned"][target]["edit"].includes(id);
  }
};
exports.authorizedToEditFile = function (targetUser, target, id) {
  if (targetUser == id) {
    return true;
  } else if (!nemo.files[targetUser]) {
    return false;
  } else if (!nemo.files[targetUser]["owned"][target]["edit"]) {
    return false;
  } else {
    return nemo.files[targetUser]["owned"][target]["edit"].includes(id);
  }
};
exports.getLinkedFiles = function (id) {
  if (!nemo.files[id]) {
    return;
  }
  return nemo.files[id].linked;
};
exports.getOwnedFiles = function (id) {
  if (!nemo.files[id]) {
    return;
  }
  return nemo.files[id].owned;
};
exports.getGroupFiles = function (gid, id) {
  if (!nemo.groups || !nemo.groups.gid) return;
  if (!nemo.groups[gid].includes(id)) return;

  let groupFiles = [];
  for (let user in nemo.groups[gid]) {
    /*For each File in Each users's directory In the group*/
    for (let file in nemo.files[nemo.groups[gid][user]].groupfiles[gid]) {
      groupFiles.push({ id: nemo.groups[gid][user], file });
    }
  }
  return groupFiles;
};
exports.addFile = function (file, id) {
  if (!nemo.files[id]) {
    nemo.files[id] = {
      owned: {},
      linked: {},
      groupfiles: {},
    };
  }
  nemo.files[id].owned[file] = {};
  nemoStorageChanged = true;
  return true;
};
exports.deleteFile = function (file, targetUser) {
  if (!nemo.files[targetUser]) {
    return;
  }
  exports.removeShare(file, targetUser);
  delete nemo.files[targetUser].owned[file];
  nemoStorageChanged = true;
  return true;
};
exports.shareFile = function (file, options, uuid) {
  if (!nemo.files[uuid].owned[file]) {
    return;
  }
  nemo.files[uuid].owned[file] = {
    edit: options.edit,
    view: options.view,
  };
  for (let id in options.edit) {
    if (!nemo.files[options.edit[id]]) {
      nemo.files[options.edit[id]] = {
        owned: {},
        linked: {},
        groupfiles: {},
      };
    }
    if (options.edit[id] != `${uuid}`) {
      nemo.files[options.edit[id]].linked[file] = uuid;
    }
  }

  for (let id in options.view) {
    if (!nemo.files[options.view[id]]) {
      nemo.files[options.view[id]] = {
        owned: {},
        linked: {},
        groupfiles: {},
      };
    }
    if (options.view[id] != `${uuid}`) {
      nemo.files[options.view[id]].linked[file] = uuid;
    }
  }
  nemoStorageChanged = true;
  return true;
};
exports.createGroup = function (gid, members) {
  //Return nothing if the group already exists
  if (gid in nemo.groups) {
    return;
  }
  //Assign the actual members to the groupID and generate a predefined "Friendly Name"
  nemo.groups[gid] = members;
  let selectedValues = [];
  let val;
  //If there are less than 3 members, automatically push both of them to the friendly name.
  if (members.length < 2) {
    selectedValues.push(0);
  }
  //Randomly select members of the group to create the friendly name.
  do {
    val = Math.floor(Math.random() * Math.floor(members.length));
    if (!selectedValues.includes(val)) {
      selectedValues.push(val);
    }
  } while (selectedValues.length < 2 && members.length > 2);
  let friendlyName;
  //Give the friendly name to all members of the group
  for (let m in members) {
    if (selectedValues.includes(members[m])) {
      selectedValues.splice(selectedValues.indexOf(members[m]), 1);
      friendlyName = `You, ${exports.getUser(members[selectedValues[0]])}`;
    } else {
      friendlyName = `${exports.getUser(
        members[selectedValues[0]]
      )}, ${exports.getUser(members[selectedValues[1]])}...`;
    }
    groupEditFriendly(friendlyName, gid, members[m]);
  }
  //Return true and alert the database that it needs to update itself
  nemoStorageChanged = true;
  return true;
};
exports.createUser = function (username, password, uuid) {
  usersCont[uuid] = {};
  usersCont[uuid]["username"] = username;
  usersCont[uuid]["password"] = password;
  usersCont[uuid]["storage"] = defaultStorageSize;
  nemo.files[uuid] = {
    owned: {},
    linked: {},
    groupfiles: {},
  };
  userStorageChanged = true;
  nemoStorageChanged = true;
  fs.mkdirSync(`${__dirname}/uploads/${uuid}`);
};
exports.deleteUser = function (uuid) {
  delete usersCont[uuid];
  delete nemo.files[uuid];
  rimraf.sync(__dirname + "uploads/" + uuid + "/");
  userStorageChanged = true;
  nemoStorageChanged = true;
};
exports.shareGroupFile = function (file, options, gid, id) {
  if (!nemo.files[id].owned[file]) {
    return;
  }
  if (!options.edit[id]) {
    options.edit.push(id);
  }

  if (!nemo.groups[gid]) return;
  if (!nemo.files[id].groupfiles[gid]) {
    nemo.files[id].groupfiles[gid] = [];
  }
  exports.shareFile(file, options, id);
  if (!nemo.files[id].groupfiles[gid].includes(file)) {
    nemo.files[id].groupfiles[gid].push(file);
  } else {
    return;
  }
  nemoStorageChanged = true;
  return true;
};
exports.removeShare = function (file, id) {
  if (!nemo.files[id].owned[file]) {
    return;
  }
  for (let type in nemo.files[id].owned[file]) {
    for (let user in nemo.files[id].owned[file][type]) {
      delete nemo.files[nemo.files[id].owned[file][type][user]].linked[file];
    }
    delete nemo.files[id].owned[file][type];
  }

  for (let gid in nemo.files[id].groupfiles) {
    if (nemo.files[id].groupfiles[gid].includes(file)) {
      nemo.files[id].groupfiles[gid].splice(
        nemo.files[id].groupfiles[gid].indexOf(file),
        1
      );
      if (nemo.files[id].groupfiles[gid].length == 0) {
        delete nemo.files[id].groupfiles[gid];
      }
    }
  }
  nemoStorageChanged = true;
  return true;
};
exports.removeGroupShare = function (file, gid, id) {
  let removeSuccess = exports.removeShare(file, id);
  if (!removeSuccess) {
    return;
  }
  nemo.files[id].groupfiles[gid].splice(
    nemo.files[id].groupfiles[gid].indexOf(file),
    1
  );
  if (nemo.files[id].groupfiles[gid].length == 0) {
    delete nemo.files[id].groupfiles[gid];
  }
  nemoStorageChanged = true;
  return true;
};
