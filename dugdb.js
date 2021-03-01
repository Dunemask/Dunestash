// Data User Group database
const { v4: uuidv4 } = require("uuid"); // Depends on uuid module
class Dugdb {
  constructor() {
    this.users = {};
    this.files = {};
    this.groups = {};
  }
  getUser(uuid) {
    return this.users[uuid];
  }
  getFile(uuid) {
    return this.files[uuid];
  }
  getGroup(uuid) {
    return this.groups[uuid];
  }
  getFileArray(arr) {
    ret = [];
    for (i in arr) {
      ret.push(getFile(i));
    }
    return ret;
  }
  getUserArray(arr) {
    ret = [];
    for (i in arr) {
      ret.push(getUser(i));
    }
    return ret;
  }
  getGroupArray(arr) {
    ret = [];
    for (i in arr) {
      ret.push(getGroup(i));
    }
    return ret;
  }

  addUser(user) {
    this.users[user.uuid] = user;
    return user.uuid;
  }
  addFile(file) {
    this.users[file.owner].ownedFiles.push(file.uuid);
    this.files[file.uuid] = file;
    return file.uuid;
  }
  addGroup(group) {
    this.users[group.owner].groups.push(group.uuid);
    this.groups[group.uuid] = group;
    this.addUserToGroup(group.owner, group.uuid, "owner");
    return group.uuid;
  }
  newUser(name, hash, email, storage = 999) {
    return {
      uuid: Dugdb.getNewUUID(),
      username: name,
      hash: hash,
      storage: storage,
      ownedFiles: [],
      sharedFiles: [],
      groups: [],
      email: email,
    };
  }
  newFile(owner, path) {
    return {
      uuid: Dugdb.getNewUUID(),
      owner: owner,
      path: path,
      viewList: [],
      editList: [],
      isPublic: false,
      groups: [],
    };
  }
  newGroup(owner, name) {
    return {
      uuid: Dugdb.getNewUUID(),
      owner: owner,
      viewFiles: [],
      editFiles: [],
      users: [],
      name: name,
    };
  }
  static getNewUUID() {
    return uuidv4();
  }
  addUserToGroup(userid, groupid, perm) {
    this.users[userid].groups.push(groupid);
    this.groups[groupid].users.push({user:userid, perm: perm});
  }
  getExportObject() {
    return {
      users: this.users,
      files: this.files,
      groups: this.groups,
    };
  }
  loadData(obj) {
    this.users = obj.users;
    this.files = obj.files;
    this.groups = obj.groups;
  }
}

module.exports = {
  Dugdb: Dugdb,
};
