//Module Imports
const { resolve: resolvePath } = require("path");
const {
  existsSync: fexists,
  mkdirSync: mkdir,
  readdirSync: readdir,
  unlinkSync: fremove,
} = require("fs");
const AdmZip = require("adm-zip");
//Local Imports
const Pharaoh = require("../egypt/pharaoh");
const desertConfig = require("../egypt/desert_config.json");
const config = require("../config.json");
//Constants
const fileStorage = new Pharaoh(
  resolvePath(desertConfig.desertPath),
  desertConfig.schema
);
const zipDir = resolvePath(config.Storage.ZipPath);
function addFile(fileData) {
  fileStorage.addEntry(fileData.fileUuid, "files", fileData);
  fileStorage.updateEntry(fileData.owner, "uuid", (entry) => {
    if (entry == null) this.createUser(ownerUuid);
    entry.owned.push(fileData.fileUuid);
    return entry;
  });
}
function updateReferenceOnDelete(fileData) {
  if (fileData == null) return;
  //Update Users Shared List (edit)
  fileData.edit.forEach((user) => {
    fileStorage.updateEntry(user, "uuid", (entry) => {
      if (entry == null) return;
      entry.shared.splice(entry.shared.indexOf(fileData.fileUuid), 1);
      return entry;
    });
  });
  //Update Users Shared List (view)
  fileData.view.forEach((user) => {
    fileStorage.updateEntry(user, "uuid", (entry) => {
      if (entry == null) return;
      entry.shared.splice(entry.shared.indexOf(fileData.fileUuid), 1);
      return entry;
    });
  });

  fileStorage.updateEntry(fileData.owner, "uuid", (entry) => {
    if (entry == null) return;
    entry.owned.splice(entry.owned.indexOf(fileData.fileUuid), 1);
    return entry;
  });
}
function deleteFile(fileUuid) {
  const fileData = fileStorage.deleteEntry(fileUuid, "files");

  return fileData;
}
function getFile(fileUuid) {
  return fileStorage.loadEntry(fileUuid, "files");
}
function modifyFile(fileUuid, cb) {
  fileStorage.updateEntry(fileUuid, "files", cb);
}
function zipFiles(files) {}
function createUser(uuid) {
  const userData = {
    owned: [],
    shared: [],
    storage: config.Storage.UserStorageSize * config.Storage.UserStorageUnit,
    usedStorage: 0,
  };
  fileStorage.updateEntry(uuid, "uuid", (entry) => {
    if (entry != null) return;
    return userData;
  });
  return userData;
}
function updateUser(ownerUuid, cb) {
  fileStorage.updateEntry(ownerUuid, "uuid", cb);
}
function getOwnedFileList(ownerUuid) {
  const owner = fileStorage.loadEntry(ownerUuid, "uuid");
  if (owner == null) return;
  return owner.owned;
}
function getSharedFileList(ownerUuid) {
  const owner = fileStorage.loadEntry(ownerUuid, "uuid");
  if (owner == null) return;
  return owner.shared;
}
function setMaxStorage(ownerUuid, newMax) {
  fileStorage.updateEntry(ownerUuid, "uuid", (entry) => {
    if (entry == null) this.createUser(ownerUuid);
    entry.storage = newMax;
    return entry;
  });
}
function modifyUsedStorage(ownerUuid, cb) {
  fileStorage.updateEntry(ownerUuid, "uuid", (entry) => {
    if (entry == null) entry = this.createUser(ownerUuid);
    const maxStorage = entry.storage;
    const newUsed =
      cb(entry.storage, entry.usedStorage ?? 0) ?? entry.usedStorage;
    if (newUsed > maxStorage)
      throw new Error("New Size Exceeds User Max Storage!");
    entry.usedStorage = newUsed;
    return entry;
  });
}
async function buildZip(ownerUuid, paths, zipUuid) {
  //Create directory and build zip with adm zip
  const zipPath = resolvePath(zipDir, `${zipUuid}.zip`);
  var zip = {
    owner: ownerUuid,
    path: zipPath,
    building: true,
  };
  fileStorage.addEntry(zipUuid, "zips", zip);
  createZip(paths, zipPath).then(() => {
    fileStorage.updateEntry(zipUuid, "zips", (entry) => {
      if (entry == null) return;
      entry.exp = Date.now() + config.Storage.ZipClickExpire;
      delete entry.building;
      return entry;
    });
  });
}
async function createZip(paths, zipPath) {
  if (!fexists(zipDir)) mkdir(zipDir);
  let zipFile = new AdmZip();
  paths.forEach((filePath) => {
    zipFile.addLocalFile(filePath);
  });
  setTimeout(() => zipFile.writeZip(zipPath), 0);
}
function getZipPath(ownerUuid, zipUuid) {
  var zipPath, building;
  fileStorage.updateEntry(zipUuid, "zips", (entry) => {
    if (entry == null || (building = entry.building)) return;
    entry.exp = Date.now() + config.Storage.ZipDownloadExpire;
    zipPath = entry.path;
    return entry;
  });
  if (building === true) return building;
  if (zipPath == null || !fexists(zipPath)) return;
  return zipPath;
}
function cleanZips() {
  var zipUuid;
  const time = Date.now();
  readdir(zipDir).forEach((file) => {
    zipUuid = file.substring(0, file.indexOf(".zip"));
    fileStorage.updateEntry(zipUuid, "zips", (entry, deleteEntry) => {
      if (entry == null) return;
      if (entry.building === true) return;
      if (entry.exp <= time) {
        deleteEntry();
        fremove(entry.path);
      }
    });
  });
}
module.exports = {
  addFile,
  updateReferenceOnDelete,
  deleteFile,
  getFile,
  modifyFile,
  createUser,
  updateUser,
  getOwnedFileList,
  getSharedFileList,
  setMaxStorage,
  modifyUsedStorage,
  cleanZips,
};
