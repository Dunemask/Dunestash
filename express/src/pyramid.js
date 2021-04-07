//Module Imports
const {
  mkdirSync: mkdir,
  existsSync: fexists,
  readFileSync: fread,
  writeFileSync: fwrite,
  rmSync: fremove,
} = require("fs");
const { join: joinPath, basename } = require("path");
//Constants
const pyramidEncoding = "utf8";
const pointerExtension = ".json";
const storageExtension = ".json";
module.exports = class Pyramid {
  static load(filePath) {
    const pointerFile = filePath + pointerExtension;
    if (!fexists(pointerFile))
      throw new Error(`Pyramid Not Found At ${pointerFile}`);
    const pointerData = JSON.parse(fread(pointerFile, pyramidEncoding));
    return new Pyramid(
      filePath,
      pointerData.tokenList,
      pointerData.tokenSplitters,
      pointerData.entrySplit,
      false
    );
  }
  /**
   * Constructor for Pyramid
   * Note: entrySplit is set to 250 automatically
   * This was the best balance of ram usage and time
   * Sample size was 50k items time: 63s average
   */
  constructor(
    filePath,
    tokenList,
    tokenSplitters,
    entrySplit = 250,
    create = true
  ) {
    if (filePath == null) throw new Error(`Filepath cannot be: ${filePath}`);
    if (tokenSplitters == null)
      throw new Error(`tokenSplitters cannot be: ${tokenSplitters}`);
    this.name = basename(filePath);
    this.pointerFile = filePath + pointerExtension;
    this.storagePath = filePath;
    this.tokenSplitters = tokenSplitters;
    this.entrySplit = entrySplit;
    this.tokenList = tokenList;
    //Create Physical Directories
    if (create) {
      this.#createPyramid();
    }
  }
  /**
   * Writes Entry to a queried storage
   */
  addStorageEntry(query, entry) {
    var pointer = this.#loadPointer();
    var storageToken = this.#queryStorageToken(query, pointer);
    var storageCount = this.#getStorageCount(storageToken, pointer);
    if (storageCount + 1 >= this.entrySplit) {
      pointer = this.#splitStorage(storageToken);
      storageToken = this.#queryStorageToken(query, pointer);
    }
    var storageData = this.#loadStorage(storageToken);
    if (storageData[query] == null)
      this.#modifyStorageCount(storageToken, 1, pointer);
    storageData[query] = entry;
    this.#writeStorage(storageToken, storageData);
  }
  /**
   * Removes Entry from a queried storage
   */
  removeStorageEntry(query) {
    const pointer = this.#loadPointer();
    const storageToken = this.#queryStorageToken(query, pointer);
    var storageData = this.#loadStorage(storageToken);
    const entry = storageData[query];
    delete storageData[query];
    if (entry != null) this.#modifyStorageCount(storageToken, -1, pointer);
    this.#writeStorage(storageToken, storageData);
    return entry;
  }

  /**
   * Load User Entry from a query
   */
  loadStorageEntry(query, cb) {
    const pointer = this.#loadPointer();
    const storageToken = this.#queryStorageToken(query, pointer);
    var storageData = this.#loadStorage(storageToken);
    const entry = storageData[query];
    if (cb !== null && typeof cb === "function") {
      cb(
        entry,
        //Update Function
        (modifiedEntry) => {
          if (storageData[query] != null)
            this.#writeEntryChanges(
              query,
              storageToken,
              storageData,
              modifiedEntry
            );
          else this.addStorageEntry(query, modifiedEntry);
        },
        //Delete Function
        () => {
          delete storageData[query];
          if (entry != null)
            this.#modifyStorageCount(storageToken, -1, pointer);
          this.#writeStorage(storageToken, storageData);
        }
      );
    } else return entry;
  }
  /**
   * Modify entry provided by a query
   */
  modifyStorageEntry(query, entry) {
    const pointer = this.#loadPointer();
    const storageToken = this.#queryStorageToken(query, pointer);
    var storageData = this.#loadStorage(storageToken);
    if (storageData[entry] == null)
      throw new Error(`Query ${query} not found!`);
    storageData[query] = entry;
    this.#writeStorage(storageToken, storageData);
  }

  /**
   * Moves one queries entry to another queries entry.
   */
  moveStorageEntry(oldQuery, newQuery) {
    const pointer = this.#loadPointer();
    const oldStorageToken = this.#queryStorageToken(oldQuery);
    const newStorageToken = this.#queryStorageToken(newQuery);
    if (oldStorageToken === newStorageToken) return;
    //Remove old data
    var storageData = this.#loadStorage(oldStorageToken);
    if (storageData == null) return;
    const entry = storageData[oldQuery];
    if (entry == null) return;
    delete storageData[oldQuery];
    this.#modifyStorageCount(oldStorageToken, -1, pointer);
    this.#writeStorage(oldStorageToken, storageData);
    //Add new data
    storageData = this.#loadStorage(newStorageToken);
    if (storageData[newQuery] == null)
      this.#modifyStorageCount(newStorageToken, 1, pointer);
    storageData[newQuery] = entry;
    this.#writeStorage(newStorageToken, storageData);
  }
  /**
   * Writes storageData to specific storage
   */
  #writeEntryChanges(query, storageToken, storageData, modifiedEntry) {
    storageData[query] = modifiedEntry;
    this.#writeStorage(storageToken, storageData);
  }
  /**
   * Returns Count of entries in storage (indexed by the pointer)
   */
  #getStorageCount(storageToken, pointer = this.#loadPointer()) {
    var parent = pointer.entries;
    for (var st of storageToken) {
      parent = parent[st];
    }
    return parent;
  }
  /**
   * Sets Count of entries in storage (stored in pointerFile)
   */
  #setStorageCount(storageToken, value, pointer = this.#loadPointer()) {
    var parentStack = [];
    var parent = pointer.entries;
    //Create "stack" of the parent references
    for (var st of storageToken) {
      parentStack.push(parent);
      parent = parent[st];
    }
    //Add Value to the stack
    parentStack.push(value);
    //Add the modified child to the previous parent, rinse, repeat, victory!
    for (var p = parentStack.length - 1; p >= 0; p--) {
      if (parentStack[p - 1] == null) break;
      parentStack[p - 1][storageToken[p - 1]] = parentStack[p];
    }
    pointer.entries = parentStack[0];
    this.#writePointer(pointer);
    return pointer;
  }
  /**
   * Modifies the storageCount by the given value
   */
  #modifyStorageCount(storageToken, value, pointer = this.#loadPointer()) {
    var parentStack = [];
    var parent = pointer.entries;
    //Create "stack" of the parent references
    for (var st of storageToken) {
      parentStack.push(parent);
      parent = parent[st];
    }
    //Mdofiy original value and add it to the stack
    parentStack.push(parent + value);
    //Add the modified child to the previous parent, rinse, repeat, victory!
    for (var p = parentStack.length - 1; p >= 0; p--) {
      if (parentStack[p - 1] == null) break;
      parentStack[p - 1][storageToken[p - 1]] = parentStack[p];
    }
    pointer.entries = parentStack[0];
    this.#writePointer(pointer);
    return pointer;
  }
  /**
   * Returns storageToken that would contain query
   */
  #queryStorageToken(query, pointer = this.#loadPointer()) {
    var parent = pointer.entries;
    var tokenLocation;
    var tokenStack = "";
    for (var l = 0; l < query.length; l++) {
      //Get the category to 'sink' current letter into
      if (this.tokenSplitters.includes(query[l])) tokenLocation = query[l];
      else tokenLocation = this.#queryStorageTokenSplitter(query[l]);
      tokenStack += tokenLocation;
      //If tokenStack is exactly their token ex:amamam
      //Immediately append the first part of the letter stack
      if (tokenStack === query) {
        var extraTokens = 0;
        while ((parent = parent[this.tokenSplitters[0]])) extraTokens++;
        return tokenStack + this.tokenSplitters[0].repeat(extraTokens);
      }
      //If Parent has children, keep going
      if (
        typeof parent[tokenLocation] === "object" &&
        !(parent[tokenLocation] instanceof Array)
      ) {
        parent = parent[tokenLocation];
      } else break;
    }
    return tokenStack;
  }
  /**
   * Returns token that should envelop the queried token
   * EX: tokenSplitters = [a,m] Query = c returns a
   */
  #queryStorageTokenSplitter(query) {
    const queryIndex = this.tokenList.indexOf(query);
    if (queryIndex === -1) return this.tokenSplitters[0];
    for (var s in this.tokenSplitters) {
      if (this.tokenList.indexOf(this.tokenSplitters[s]) >= queryIndex)
        return this.tokenSplitters[Math.max(0, s - 1)];
    }
    return this.tokenSplitters[s];
  }
  /**
   * Creates Pointer File and intializes all storages
   */
  #createPyramid() {
    if (fexists(this.pointerFile)) {
      console.warn(
        "Warning: DatabasePointer already exists!",
        this.pointerFile,
        "Skipping.."
      );
      return;
    }
    var databaseSchema = {
      entrySplit: this.entrySplit,
      tokenSplitters: this.tokenSplitters,
      tokenList: this.tokenList,
      entries: {},
    };
    if (!fexists(this.storagePath)) mkdir(this.storagePath);
    //Add All
    for (var s of this.tokenSplitters) {
      databaseSchema.entries[s] = 0;
      this.#writeStorage(s, {});
    }
    this.#writePointer(databaseSchema);
  }
  /**
   * Writes data to Pyramid Storage based on storageToken
   */
  #writeStorage(storageToken, data) {
    const storageFile = this.#storageFile(storageToken);
    fwrite(storageFile, JSON.stringify(data));
  }
  /**
   * Write data pointerFile
   */
  #writePointer(data) {
    fwrite(this.pointerFile, JSON.stringify(data));
  }
  /**
   * Load pointerFile Object
   */
  #loadPointer() {
    return JSON.parse(fread(this.pointerFile, pyramidEncoding));
  }
  /**
   * Loads storage object given a storageToken
   */
  #loadStorage(storageToken) {
    return JSON.parse(fread(this.#storageFile(storageToken), pyramidEncoding));
  }
  /**
   * Deletes a particular storage
   */
  #removeStorage(storageToken) {
    const storageFile = this.#storageFile(storageToken);
    if (fexists(storageFile)) fremove(storageFile);
  }
  /**
   * Joins the storageToken path and pyramidpath
   */
  #storageFile(token) {
    return joinPath(this.storagePath, token + storageExtension);
  }
  /**
   * Splits the specified storage (located with storageToken)
   * into the different files specified by this.tokenSplitters
   */
  #splitStorage(oldToken, pointer = this.#loadPointer()) {
    const oldStorage = this.#loadStorage(oldToken);
    const oldKeys = Object.keys(oldStorage);
    var newStorages = {};
    var newStorageCount = {};
    //Set Default Count and create empty objects for new storage
    for (var s of this.tokenSplitters) {
      newStorageCount[s] = 0;
      newStorages[oldToken + s] = {};
    }
    /*Calculate next token to add to the storagePath for each entry
     *If the token is already <= the length of the new token
     *add the standard first token.
     *Ex: entry: mouse into mouse -> mousea
     *Else calculate next letter
     *
     * Then add to new storage count and assign storage
     * In theory the total ram useage should never be more than double
     * than the original size of the storage
     */
    var migratedTokenStack, additionalToken;
    for (var k of oldKeys) {
      migratedTokenStack = oldToken;
      if (k.length <= oldToken.length + 1)
        additionalToken = this.tokenSplitters[0];
      else
        additionalToken = this.#queryStorageTokenSplitter(
          this.tokenSplitters,
          k[oldToken.length]
        );
      migratedTokenStack += additionalToken;
      newStorages[migratedTokenStack][k] = oldStorage[k];
      newStorageCount[additionalToken]++;
    }
    for (var st in newStorages) {
      this.#writeStorage(st, newStorages[st]);
    }
    this.#removeStorage(oldToken);
    return this.#setStorageCount(oldToken, newStorageCount);
  }
};
