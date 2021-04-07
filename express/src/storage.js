//Module Imports
const { resolve: resolvePath } = require("path");
const {
  existsSync: fexists,
  mkdirSync: mkdir,
  readdirSync: readdir,
  unlinkSync: fremove,
} = require("fs");
const AdmZip = require("adm-zip");
const uuidGen = require("uuid");
//Local Imports
const Pharaoh = require("./pharaoh");
const desertConfig = require("./desert.json");
const config = require("../config.json");
//Constants
const fileStorage = new Pharaoh(
  resolvePath("./", desertConfig.desertPath),
  desertConfig.schema
);
const zipDir = resolvePath("./", config.Storage.ZipPath);
exports.addFile = (fileData) => {
  fileStorage.addEntry(fileData.fileUuid, "files", fileData);
  fileStorage.updateEntry(fileData.owner, "uuid", (entry) => {
    if (entry == null) return;
    entry.owned.push(fileData.fileUuid);
    return entry;
  });
};
exports.updateReferenceOnDelete = (fileData) => {
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
};
exports.deleteFile = (fileUuid) => {
  const fileData = fileStorage.deleteEntry(fileUuid, "files");

  return fileData;
};
exports.getFile = (fileUuid) => {
  return fileStorage.loadEntry(fileUuid, "files");
};
exports.modifyFile = (fileUuid, cb) => {
  fileStorage.updateEntry(fileUuid, "files", cb);
};
exports.zipFiles = (files) => {};
exports.createUser = (uuid) => {
  fileStorage.updateEntry(uuid, "uuid", (entry) => {
    if (entry != null) return;
    return {
      owned: [],
      shared: [],
      storage: config.Storage.UserStorageSize * config.Storage.UserStorageUnit,
      usedStorage: 0,
    };
  });
};
exports.updateUser = (ownerUuid, cb) => {
  fileStorage.updateEntry(ownerUuid, "uuid", cb);
};
exports.getOwnedFileList = (ownerUuid) => {
  const owner = fileStorage.loadEntry(ownerUuid, "uuid");
  if (owner == null) return;
  return owner.owned;
};
exports.getSharedFileList = (ownerUuid) => {
  const owner = fileStorage.loadEntry(ownerUuid, "uuid");
  if (owner == null) return;
  return owner.shared;
};
exports.setMaxStorage = (ownerUuid, newMax) => {
  fileStorage.updateEntry(ownerUuid, "uuid", (entry) => {
    entry.storage = newMax;
    return entry;
  });
};
exports.modifyUsedStorage = (ownerUuid, cb) => {
  fileStorage.updateEntry(ownerUuid, "uuid", (entry) => {
    const maxStorage = entry.storage;
    const newUsed =
      cb(entry.storage, entry.usedStorage ?? 0) ?? entry.usedStorage;
    if (newUsed > maxStorage)
      throw new Error("New Size Exceeds User Max Storage!");
    entry.usedStorage = newUsed;
    return entry;
  });
};
exports.buildZip = async (ownerUuid, paths) => {
  //Create directory and build zip with adm zip
  if (!fexists(zipDir)) mkdir(zipDir);
  let zipFile = new AdmZip();
  paths.forEach((filePath) => {
    zipFile.addLocalFile(filePath);
  });
  const zipUuid = uuidGen.v4() + Date.now();
  const zipPath = resolvePath(zipDir, `${zipUuid}.zip`);
  zipFile.writeZip(zipPath);
  var zip = {
    owner: ownerUuid,
    path: zipPath,
    exp: Date.now() + config.Storage.ZipClickExpire,
  };
  fileStorage.addEntry(zipUuid, "zips", zip);
  return zipUuid;
};
exports.getZip = (ownerUuid, zipUuid) => {
  var zipPath;
  fileStorage.updateEntry(zipUuid, "zips", (entry) => {
    if (entry == null) return;
    entry.exp = Date.now() + config.Storage.ZipDownloadExpire;
    zipPath = entry.path;
    return entry;
  });
  if (zipPath == null || !fexists(zipPath)) return;
  return zipPath;
};
exports.cleanZips = () => {
  var zipUuid;
  const time = Date.now();
  readdir(zipDir).forEach((file) => {
    zipUuid = file.substring(0, file.indexOf(".zip"));
    fileStorage.updateEntry(zipUuid, "zips", (entry, deleteEntry) => {
      if (entry == null) return;
      if (entry.exp <= time) {
        deleteEntry();
        fremove(entry.path);
      }
    });
  });
};
