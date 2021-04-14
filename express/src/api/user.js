//Module Imports
const { resolve: resolvePath } = require("path");
const { existsSync: fexists, unlinkSync: fremove } = require("fs");
const uuidGen = require("uuid-with-v6").v6;
//Local Imports
const storage = require("./storage");
const config = require("../config.json");
/**
 * Generates a new uuid.v6() and reverses the uuid so the timestamp is at the end
 * This should provide an additional layer of "randomness" and decrease the chances
 * of duplicate uuid's being generated.
 * This is reversed to force the custom DB to expand faster at first rather than
 * later when there are lots of entries.
 */
function generateUuid() {
  return [...uuidGen()].reverse().join("");
}
/**
 * Create a user with a uuid (should use Dunestorm API to login)
 */
function createUser(uuid) {
  storage.createUser(uuid);
}
/**
 * Creates file entry given aspects of a file updated
 */
function uploadFile(uuid, fileData) {
  const fileUuid = generateUuid();
  var sizeAccepted;
  storage.modifyUsedStorage(uuid, (max, used) => {
    const oldUsed = used;
    used += fileData.size;
    if ((sizeAccepted = used <= max)) return used;
  });
  if (!sizeAccepted) return;
  const file = {
    fileUuid,
    path: fileData.path,
    owner: uuid,
    name: fileData.originalname,
    date: fileData.filename.substring(0, fileData.filename.indexOf("-")),
    size: fileData.size,
    public: false,
    edit: [],
    view: [],
  };
  storage.addFile(file);
  return file;
}
/**
  TODO: ASYNCIFY?
  Removes user references to files that are being deleted
 */
function removeEntryLinks(files) {
  for (var o in files.owner) {
    storage.updateUser(o, (entry) => {
      if (entry == null) return;
      files.owner[o].forEach((file) => {
        entry.owned.splice(entry.owned.indexOf(file.fileUuid), 1);
        entry.usedStorage -= file.size;
      });
      return entry;
    });
  }
  for (var user in files.edit) {
    storage.updateUser(user, (entry) => {
      if (entry == null) return;
      files.edit[user].forEach((file) => {
        entry.edit.splice(entry.edit.indexOf(file), 1);
      });
      return entry;
    });
  }
  for (var user in files.view) {
    storage.updateUser(user, (entry) => {
      if (entry == null) return;
      files.view[user].forEach((file) => {
        entry.view.splice(entry.view.indexOf(file), 1);
      });
      return entry;
    });
  }
}
/**
 * Deletes files.
 * Requires Uuid to garuntee permission to delete a file
 * Sorts files by user before deleting to speed up reference updates
 */
function deleteFiles(uuid, targetFiles) {
  var deleteFails = [];
  //Sort files by fileuuid to remove entries from the various users
  var filesSortedByUser = {
    owner: {},
    edit: {},
    view: {},
  };
  targetFiles.forEach((targetFile) => {
    storage.modifyFile(targetFile, (entry, deleteEntry) => {
      if (!authorizedToEditFile(uuid, entry)) return;
      //Add owner and file size to the update object
      if (filesSortedByUser.owner[entry.owner] == null)
        filesSortedByUser.owner[entry.owner] = [];
      filesSortedByUser.owner[entry.owner].push({
        fileUuid: targetFile,
        size: entry.size,
      });
      //Add edit members to the edit update
      for (var id of entry.edit) {
        if (entry.edit[id] == null) entry.edit[id] = [];
        entry.edit[id].push(targetFile);
      }
      //Add view members to the view update
      for (var id of entry.view) {
        if (entry.view[id] == null) entry.view[id] = [];
        entry.view[id].push(targetFile);
      }
      //Throw stuff in a catch, we need to make sure we delete the file physically
      try {
        deleteEntry(entry);
        fremove(entry.path);
      } catch (e) {
        console.error("Error Deleting File", entry.name, "\nPath:", entry.path);
        deleteFails.push(targetFile);
      }
    });
  });
  //Updates user entries using the filesSortedByUser
  removeEntryLinks(filesSortedByUser);
  //Return the new used storage to update the database
  return deleteFails.length > 0 && deleteFails;
}
/**
 * Checks that a user is authourized to view the file and then
 * Returns the physical filePath of a desired file (uses entry to find path)
 */
function getFilePath(uuid, targetFile) {
  const fileData = storage.getFile(targetFile);
  if (!authorizedToViewFile(uuid, fileData)) return;
  if (fexists(fileData.path)) return fileData.path;
}
/**
 * Returns a list of fileUuids that the user owns
 */
function getOwnedFiles(uuid) {
  const fileList = storage.getOwnedFileList(uuid);
  if (fileList == null) return [];
  var files = new Array(fileList.length);
  fileList.forEach((file, i) => {
    files[i] = storage.getFile(file);
  });
  return files;
}
/**
 * TODO: Impliment Zips
 * Creates a zip file and returns the zipUuid to the client.
 */
async function requestZip(uuid, targetFiles, cb) {
  var zipPath, fileData;
  var filePaths = new Array(targetFiles.length);
  for (var file of targetFiles) {
    fileData = storage.getFile(file);
    if (!authorizedToViewFile(uuid, fileData)) return;
    if (!fexists(fileData.path)) return;
    filePaths.push(fileData.path);
  }
  const zipUuid = generateUuid();
  cb(zipUuid);
  setTimeout(() => storage.buildZip(uuid, filePaths, zipUuid), 0);
  return zipUuid;
}
/**
 * TODO: Impliment Zips
 * Returns zip path from a zipUuid
 */
function getZipPath(uuid, targetZip) {
  return storage.getZipPath(uuid, targetZip);
}
/**
 * TODO: Impliment Advanced Sharing
 * Shares file with various people, and various permissions
 */
function shareFile(uuid, targetFile) {
  console.log(uuid, "requesting to share file");
  console.log(targetFile);
}
/**
 * TODO: Impliment Advanced Sharing
 * Returns all files shared with a user
 */
function getSharedFiles(uuid) {
  return storage.getSharedFileList(uuid);
}
/**
 * Checks is a user is authorized to edit a particular file
 */
function authorizedToEditFile(client, fileData) {
  if (fileData == null) return false;
  if (fileData.owner === client) return true;
  return fileData.edit.includes(client);
}
/**
 * Checks is a user is authorized to view a particular file
 */
function authorizedToViewFile(client, fileData) {
  if (fileData == null) return false;
  if (fileData.public === true) return true;
  if (fileData.owner === client) return true;
  return fileData.edit.includes(client) || fileData.view.includes(client);
}
/**
 * Checks if a the user is the owner and then toggles the list of files to public
 */
function publicfyFiles(uuid, files) {
  var publicfyFails = [];
  files.forEach((file, i) => {
    storage.modifyFile(file, (entry) => {
      if (entry == null || entry.owner !== uuid) {
        publicfyFails.push(file);
        return;
      }
      entry.public = !entry.public;
      return entry;
    });
  });
  //Return the new used storage to update the database
  return publicfyFails.length > 0 && publicfyFails;
}
module.exports = {
  createUser,
  uploadFile,
  deleteFiles,
  getFilePath,
  getOwnedFiles,
  publicfyFiles,
  shareFile,
  getSharedFiles,
  requestZip,
  getZipPath,
};
