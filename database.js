const fs = require("fs");
const defaultImage='/files/images/blank_user.svg';
const FILESIZE_MB = Math.pow(1024,2);
const FILESIZE_GB = Math.pow(1024,3);
const defaultStorageSize = 2;
const rimraf = require('rimraf');

const bcrypt = require('bcrypt'); // Hashing
const SALT_ROUNDS = 10;

const dugdbLocation = __dirname + "/src/dugdatabase.json"
const dugdbTempPath = __dirname + "/src/dugdatabase-tmp.json"
const ddb = require('./dugdb.js'); // Main Database Object

const adminConfig = {useAdmin:true, email:"abc@xyz.com", pwd:"password", username:"admin",storage:999};

let dugdb;

let dbChanged = false;


exports.init = () => {
    dugdb = new ddb.Dugdb();
    if(fs.existsSync(dugdbLocation)) {
        dugdb.loadData(JSON.parse(fs.readFileSync(dugdbLocation)));  
    } else {
        if(adminConfig.useAdmin) {
            const hash = bcrypt.hashSync(adminConfig.pwd, SALT_ROUNDS);
            let admin = dugdb.newUser(adminConfig.username, hash, adminConfig.email, adminConfig.storage);
            dugdb.addUser(admin);
        }
    }      
}

// User Creation
exports.createUser = function(username, password, email) { // Setus up new user
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
}
exports.deleteUser = function(uuid) { // Removes user
    for(i in dugdb.users[uuid].ownedFiles){
        this.deleteFile(i, uuid);
    }
    delete dugdb.users[uuid];
    rimraf.sync(__dirname+"uploads/"+uuid+"/");
    return true;
    dbChanged=true;
}
// User Data
exports.getUuid = function(username) { // Returns user uuid by searching username
  let uid;
  for(key in dugdb.users) {
    let u = dugdb.users[key].username;
      if(u.toLowerCase() == username.toLowerCase()) {
        uid = key;
        break;
      }
    }
    return uid;
}
exports.userExists = (username) =>{
  return !(!(this.getUuid(username)));
}
exports.userUuidExists = (uuid) =>{
  return !(!(dugdb.users[uuid]));
}
exports.getUser = function(uuid) { // Returns username, misnomer call it getUsername()  
    
    return dugdb.users[uuid].username;
}
exports.getUserObject = function(uuid) { // Returns an object holding much information about user  
    return dugdb.users[uuid];
}
exports.getUserStorageSize = function(uuid){ // Storage Size
  return parseInt(dugdb.users[uuid].storage)*FILESIZE_GB;
}
exports.getUserEmail = function(uuid) { // Email
    return dugdb.users[uuid].email;
}
exports.getUserImage = function(uuid){ // Returns path to user image
  let userImage =`/files/images/user-images/${uuid}`;
  if (!fs.existsSync(__dirname+"/www"+userImage) || uuid== undefined) {
    userImage=defaultImage;
  }
  return userImage;
}
exports.getUserGroups = function(uuid) { // Returns list of group objects
    userGroups = [];
    for(gid in dugdb.users[uuid].groups){
        userGroups.push(dugdb.getGroup(gid))
    }
  return userGroups;
}
exports.getUserGroupPermission = function(uuid, gid) { // Returns the permission the user has in the group
    /*if(dugdb.groups[gid].owner = uuid) {
        return "manager";
    }*/
    return dugdb.groups[gid].users[uuid].perm;
}
exports.validateCredentials = function(user, pass) { // username & password validation
  let working=false;
  if(!user)
    return false;
  let uuid=this.getUuid(user);
  if(uuid!=undefined && pass!=undefined){
    working = bcrypt.compareSync(pass,dugdb.users[uuid].hash);
  }
  return working;
}
exports.validateCredentialsOnUuid = function(uuid, pass) { // uuid & password validation
  let working=false;
  if(uuid!=undefined && pass!=undefined){
    working = bcrypt.compareSync(pass,dugdb.users[uuid].hash);
  }
    return working;
}
exports.changeUsername = function(uuid, username) { // change username by uuid, accounts for all usernames in db
    usernameTaken = this.userExists(username);  
    if(!usernameTaken){
        dugdb.users[uuid].username = username;
        dbChanged = true;
    }
    return !usernameTaken;
}
exports.changePassword = function(uuid, password) { // change password by uuid
    const hash = bcrypt.hashSync(password, SALT_ROUNDS);  
    dugdb.users[uuid].hash = hash;
    dbChanged=true;
    return;
}


//Update Databases
exports.updateUserStorage = function(forceUpdate) { // creates file to store database
  if(dbChanged||forceUpdate){
    if(!fs.existsSync(dugdbLocation)){
        fs.writeFileSync(dugdbLocation,'');
        console.log("New DB file created at: "+dugdbLocation);
    }
    dbChanged = false;
    let jsonString = JSON.stringify(dugdb.getExportObject());
    if(!fs.existsSync(dugdbTempPath)){
        fs.copyFileSync(dugdbLocation,dugdbTempPath,fs.constants.COPYFILE_EXCL);
    }else{
        console.error('TMP DATABASE FILE ALREADY EXISTS FOR SOME REASON...');
        return;
    }
    let doubleCheckSuccess = false;
    try{
        fs.unlinkSync(dugdbLocation);
        fs.writeFileSync(dugdbLocation,jsonString);
        doubleCheckSuccess = true;
    } catch(err) {
        console.error("ISSUE COPYING, REVERTING TO PREVIOUS VERSION");
        fs.copyFileSync(dugdbTempPath,dugdbLocation,fs.constants.COPYFILE_EXCL);
    }
    if(doubleCheckSuccess){
      fs.unlinkSync(dugdbTempPath);
    }
  }
}
exports.updateNemoStorage = function(forceUpdate) { // what is a nemo anyways
  console.log("what is a nemo anyways...")
}
exports.updateAllStorage = function(forceUpdate) { // Updates all storage
  exports.updateUserStorage(forceUpdate);
  exports.updateNemoStorage(forceUpdate);
}


//File Control
exports.authorizedToViewFile = function(target, id) { // is user authorized to view a file?
  if(!this.fileExists(target)){
  return false;
  }

    if(dugdb.files[target].owner == id){
    return true;
  }else if( dugdb.files[target].viewList[id] == true || 
            dugdb.files[target].editList[id] == true){
    return true;
  }else{
    for (i in dugdb.users[id].groups) {
        let grp = dugdb.groups[i];
        if(grp.viewFiles[target] || grp.editFiles[target]){
            return true;
        }
    }
    return false;
  }
}
exports.authorizedToEditFile = function(target, id){ // is user authorized to edit file?
    if(!this.fileExists(target)){
  return false;
  }  
    if(dugdb.files[target].owner == id){
    return true;
  }else if( dugdb.files[target].editList[id] == true){
    return true;
  } else {
    for(i in dugdb.users[id].groups) {
        let grp = dugdb.groups[i];
        if(grp.editFiles[target]) {
            if(grp.users[id].perm != "viewer"){
                return true;
            }
        }
    }
      return false;

  }
}
exports.getSharedFiles = function(id){ // Returns list of file IDs that is shared to the user
  if(!dugdb.users[id]){
    return;
  }
  return dugdb.users[id].sharedFiles;
}
exports.getOwnedFiles = function(id){ // Returns list of file IDs that is owned by the user
  if(!dugdb.users[id]){
    return;
  }
  return dugdb.users[id].ownedFiles;
}
exports.getGroupFiles = function(gid,id){ // Returns a list of files that user has access via group (both view and edit)
  if(!dugdb.groups[gid])
    return;
  if(!users.groups.includes(id))
    return;

  let groupFiles = [];
  for(i in dugdb.groups[gid].editFiles) {
    groupFiles.push(i);
  }
  for(i in dugdb.groups[gid].viewFiles) {
    groupFiles.push(i);
  }
  return groupFiles;
}
// File mutation
exports.addFile = function(file, owner) { // Adds file based on user and file path.
  let f = dugdb.newFile(owner, file);
  dugdb.addFile(f);
  dbChanged = true;
  return f.uuid;
}
exports.deleteFile = function(file,targetUser) { // Deletes file from db, user, and groups...
  if(!dugdb.files[file]) {
    return false;
  }
  exports.removeShare(file,targetUser);
  exports.removeGroupShare(file,targetUser);
  //rimraf.sync(__dirname+"uploads/" + dugdb.files[file].path);
  delete dugdb.files[file];
  dbChanged=true;
  return true;
}
exports.fileExists = function(file) { // Adds file based on user and file path.
  return !(!dugdb.files[file]);
}
exports.getFile = function(file) { // Returns file object from uuid
  return dugdb.files[file];
}
exports.getFilePath = function(file) { // Returns file object from uuid
  return dugdb.files[file].path;
}
exports.getFileOwnerUsername = function(file) { // Returns username of owner
  return dugdb.users[dugdb.files[file].owner].username;
}
// User to user sharing
exports.shareFile = function(file, options, uuid) { // Shares a file to a uuid
    // Current options: {edit:boolean}
    // Also used to change the share options between user
  if(options.edit == true) {
    dugdb.files[file].editList[uuid] = true;
    delete dugdb.files[file].viewList[uuid];

  }else{
    dugdb.files[file].viewList[uuid] = true;
    delete dugdb.files[file].editList[uuid];
  }
  dugdb.users[uuid].sharedFiles[file] = options.edit;
  dbChanged = true;
  return true;
}
exports.removeShare = function(file) { // Unshares a file with everyone except for the owner
  if(!this.fileExists(file)) {
    return;
  }
  for(i in dugdb.files[file].viewList){
    delete dugdb.users[i].sharedFiles[file];
  }
  for(i in dugdb.files[file].editList){
    delete dugdb.users[i].sharedFiles[file];
  }
  dugdb.files[file].viewList = {};
  dugdb.files[file].editList = {};
  dgChanged = true;  
}
exports.removeSharedUser = function(file, user) { // Unshares a file with a specific user
  if(!this.fileExists(file) || !this.userUuidExists(user)) {
    return;
  }
  delete dugdb.files[file].viewList[user];
  delete dugdb.files[file].editList[user];
  delete dugdb.users[user].sharedFiles[file];
  dgChanged = true;  
  dbChanged = true;
}
exports.getSharedInformation = function(file) { // Returns a list of users who can access the file
    if(!dugdb.files[file]){
        return;
    }
    let obj = {edit:[],view:[]}
    for(i in dugdb.files[file].editList){
        let name = dugdb.getUser(i).username;
        obj.edit.push({id:i, name:name});
    }
    for(i in dugdb.files[file].viewList){
        let name = dugdb.getUser(i).username;
        obj.view.push({id:i, name:name});
    }
    return obj;
}



// Group Creation
exports.createGroup = function(uuid,name) { // Creates a group
    let g = dugdb.newGroup(uuid,name);
    dugdb.addGroup(g);
    dbChanged = true;
    return g.uuid;
}
exports.groupExists = (gid) => {
    return (! (!dugdb.groups[gid]));
}
exports.groupNameEdit = function(name, gid) { // changes the name of a group by gid
    dugdb.groups[gid].name = name;
    dbChanged = true;
    return true;
}
exports.getGroupName = function(gid) { // Returns name of group
    return dugdb.groups[gid].name;
}
exports.getGroupById = function(gid) { // Returns group
    return dugdb.groups[gid];
}
exports.getGroupUsers = function(gid) { // Returns names & Permissions
    let obj = [];    
    for(i in dugdb.groups[gid].users) {
        let usrobj = dugdb.groups[gid].users[i];
        obj.push({id: usrobj.user, perm: usrobj.perm, username: dugdb.getUser(usrobj.user).username})
    }
    return obj;
}
exports.getGroupOwner = function(gid) { // Returns owner of group
    return dugdb.groups[gid].owner;
}
exports.getGroupFiles = function(gid) { // Returns files in a group
let obj = {viewFiles:dugdb.groups[gid].viewFiles,editFiles:dugdb.groups[gid].editFiles};
    return (obj);
}
exports.addUserToGroup = (user, group, perm)=>{ // adds a user to a group with permissions
    // Permissions are "viewer", "member", or "manager"
    dugdb.addUserToGroup(user, group, perm);
    dbChanged = true;
    return true;
}
exports.removeUserFromGroup = (user, group)=>{ // adds a user to a group with permissions
    delete dugdb.groups[gid].users[user];
    delete dugdb.users[user].groups[gid];
    dbChanged = true;
    return true;
}
exports.shareGroupFile = function(file, options, gid) { // adds file to group with viewership
    // Current options: {edit:boolean}
    if(options.edit) {
        delete dugdb.groups[gid].viewFiles[file];
        dugdb.groups[gid].editFiles[file] = true;
    } else {
        dugdb.groups[gid].viewFiles[file] = true;
        delete dugdb.groups[gid].editFiles[file];
    }
    dugdb.files[file].groups[gid] = true;
    dbChanged = true;
    return true;
}
exports.removeGroupFile = function(file,  gid) { // removes file from group
    delete dugdb.groups[gid].viewFiles[file];
    delete dugdb.groups[gid].editFiles[file];
    delete dugdb.files[file].groups[gid];
    dbChanged = true;
    return true;
}
exports.removeGroupShare = function(file) { // Unshares a file with everyone in every group
    if(!dugdb.files[file]) {
        return;
    }
    for(i in dugdb.files[file].groups) { 
        this.removeGroupFile(file,i);
    }
    dugdb.files[file].groups = {};
    return true;
}

exports.getDDB = () =>{ // shouldn't be used, only for testing/seeing what's wrong
    return dugdb;
}


// NEED TO TEST OUT ALL FUNCTIONS AND THEN ADD SOME MORE WHEN I FEEL LIKE ITz