//Module Imports
const {
  existsSync: fexists,
  readFileSync: fread,
  writeFileSync: fwrite,
  rmSync: fremove,
} = require("fs");
const { join: joinPath, basename } = require("path");
const _ = require("lodash");
//Local Imports
const Pyramid = require("./pyramid");
//Constants
//Misc Functions
function isObject(obj) {
  return typeof obj === "object" && !(obj instanceof Array);
}
//Main Class
module.exports = class Pharoah {
  constructor(desertPath, schema) {
    this.desertPath = desertPath;
    var mainStorageName = Object.keys(schema)[0];
    var mainStorage = schema[mainStorageName];
    this.pyramids = {};
    this.pyramidSchemas = this.#buildSchema(schema);
  }

  addEntry(query, pyramidName, entry) {
    this.pyramids[pyramidName].pyramid.addStorageEntry(query, entry);
    if (!(this.pyramids[pyramidName].refs instanceof Array)) {
      return;
    }
    for (var r of this.pyramids[pyramidName].refs) {
      if (entry[r] != null)
        this.pyramids[r].pyramid.addStorageEntry(entry[r], query);
    }
  }

  deleteEntry(query, pyramidName) {
    const entry = this.pyramids[pyramidName].pyramid.removeStorageEntry(query);
    if (entry == null) return;
    if (!(this.pyramids[pyramidName].refs instanceof Array)) return entry;
    for (var r of this.pyramids[pyramidName].refs) {
      if (entry[r] != null)
        this.pyramids[r].pyramid.removeStorageEntry(entry[r]);
    }
    return entry;
  }

  updateEntry(query, pyramidName, cb) {
    if (cb === null || typeof cb !== "function")
      throw new Error("Error: Callback cannot be " + cb);
    const mainPyramid = this.pyramids[pyramidName];
    mainPyramid.pyramid.loadStorageEntry(
      query,
      (entry, update, deleteEntry) => {
        const oldWasObject = isObject(entry);
        const oldEntry = _.cloneDeep(entry);
        var entryDeleted;
        entry = cb(entry, () => {
          if (oldWasObject)
            this.#updateDeleteRef(deleteEntry, oldEntry, mainPyramid.refs);
          else deleteEntry();
          entryDeleted = true;
        });
        if (entry == null || entryDeleted || _.isEqual(oldEntry, entry)) return;
        update(entry);
        //If there are no ref objects, just return.
        if (!(mainPyramid.refs instanceof Array)) return;
        const newIsObject = isObject(entry);
        //If both are objects, compare a difference in the refs,
        if (oldWasObject && newIsObject) {
          for (var r of mainPyramid.refs) {
            if (!_.isEqual(oldEntry[r], entry[r]))
              this.#updateRef(this.pyramids[r], oldEntry[r], entry[r], query);
          }
          //If only the old is an object, remove the old references
        } else if (oldWasObject && !newIsObject) {
          for (var r of mainPyramid.refs) {
            if (entry[r] != null)
              this.pyramids[r].pyramid.removeStorageEntry(oldEntry[r]);
          }
          //If only the new is an object, only add the new references
        } else if (!oldWasObject && newIsObject) {
          for (var r of mainPyramid.refs) {
            if (entry[r] != null)
              this.pyramids[r].pyramid.addStorageEntry(entry[r], query);
          }
        }
      }
    );
  }

  loadEntry(query, pyramidName) {
    const data = this.pyramids[pyramidName].pyramid.loadStorageEntry(query);
    return data;
  }

  loadEntryByReference(query, refPyramid, targetPyramid) {
    const ref = this.loadEntry(query, refPyramid);
    if (ref == null) return;
    if (typeof ref !== "string") throw new Error("Pointer Must Be a String!");
    return this.loadEntry(ref, targetPyramid);
  }

  updateEntryByReference(query, refPyramid, targetPyramid, cb) {
    const ref = this.loadEntry(query, refPyramid);
    if (ref == null) return;
    if (typeof ref !== "string") throw new Error("Pointer Must Be a String!");
    this.updateEntry(ref, targetPyramid, cb);
  }

  #buildSchema(schema) {
    var pyramidPath, schem;
    for (var s in schema) {
      pyramidPath = joinPath(this.desertPath, s);
      if (fexists(pyramidPath)) schem = { pyramid: Pyramid.load(pyramidPath) };
      else
        schem = {
          pyramid: new Pyramid(
            pyramidPath,
            schema[s].tokenList,
            schema[s].tokenSplitters,
            schema[s].entrySplit
          ),
        };
      if (schema[s].attr != null) schem.attr = schema[s].attr;
      if (schema[s].refs != null) schem.refs = schema[s].refs;
      this.pyramids[s] = schem;
    }
  }

  #updateRef(pyramidSchema, oldRef, newRef, pointer) {
    if (oldRef == null && pointer != null)
      pyramidSchema.pyramid.addStorageEntry(newRef, pointer);
    else if (oldRef != null && newRef != null)
      pyramidSchema.pyramid.moveStorageEntry(oldRef, newRef);
    else if (oldRef != null && newRef == null)
      pyramidSchema.pyramid.removeStorageEntry(oldRef);
  }

  #updateDeleteRef(pyramidDelete, entry, refs) {
    //Calls Delete within the loadStorageEntry function
    pyramidDelete();
    if (refs != null && refs instanceof Array)
      for (var r of refs) {
        if (entry[r] != null)
          this.pyramids[r].pyramid.removeStorageEntry(entry[r]);
      }
    return true;
  }
};
