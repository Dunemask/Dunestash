const express = require("express");
const axios = require("axios");
//Local Imports & Configs
const asUser = require("../api/user");
const upload = require("../api/upload");
const config = require("../config.json");
//Establish path and create router
/** Absolute Router Path /api/stash*/
const router = express.Router();

const authMiddleware = (req, res, next) => {
  if (req.session.uuid != null) return next();
  var headers = {};
  var authToken = req.get(config.Server.jwtHeader);
  if (authToken == null) return res.sendStatus(401);
  authToken = authToken.replace("Bearer ", "");
  headers[config.Server.jwtHeader] = authToken;
  axios
    .get(config.Server.authServer, { headers })
    .then((authRes) => {
      if (authRes.status !== 200) return res.sendStatus(401);
      if (authRes.data != null) {
        req.session.uuid = authRes.data.uuid;
        next();
      } else res.sendStatus(401);
    })
    .catch((e) => {
      if (e.response != null) res.sendStatus(e.response.status);
      else res.sendStatus(401);
    });
};

router.get("/files", authMiddleware, (req, res) => {
  const files = asUser.getOwnedFiles(req.session.uuid);
  res.status(200).json(files);
});

router.post("/upload", authMiddleware, (req, res) => {
  upload.userUpload(req, res, (err) => {
    if (err || req.file == null) return res.sendStatus(500);
    const fileData = asUser.uploadFile(req.session.uuid, req.file);
    if (fileData == null) {
      upload.cancelUpload(req.file.path);
      return res.sendStatus(500);
    }
    res.json(fileData);
  });
});

router.post("/delete", authMiddleware, (req, res) => {
  if (!req.body || !(req.body instanceof Array)) {
    return res.sendStatus(400);
  }
  const failed = asUser.deleteFiles(req.session.uuid, req.body);
  if (!failed) return res.sendStatus(200);
  res.status(500).json(failed);
});

router.get("/download", async (req, res) => {
  if (!req.query || (!req.query.target && !req.query.zipTarget))
    return res.sendStatus(404);
  if (req.query.target) {
    const filePath = asUser.getFilePath(req.session.uuid, req.query.target);
    if (!filePath) return res.sendStatus(404);
    return res.download(filePath);
  }
  //ZIPS ARE NOT SUPPORTED YET
  return res.sendStatus(404);
  if (req.session.uuid == null) return res.sendStatus(401);
  if (req.query.zipTarget) {
    const zipPath = asUser.getZip(req.session.uuid, req.query.zipTarget);
    if (zipPath === true) return res.sendStatus(503);
    if (zipPath == null) return res.sendStatus(404);
    res.download(zipPath);
  }
});

//TODO
router.post("/download", authMiddleware, (req, res) => {
  //ZIPS ARE NOT SUPPORTED YET
  return res.sendStatus(404);
  if (!req.body || !(req.body instanceof Array)) {
    return res.sendStatus(400);
  }
  asUser.requestZip(req.session.uuid, req.body, (zipUuid) => {
    console.log("Client can start checking");
    return res.json(zipUuid);
  });
});

router.get("/raw", (req, res) => {
  if (!req.query || !req.query.target) return res.sendStatus(404);
  const filePath = asUser.getFilePath(req.session.uuid, req.query.target);
  if (!filePath) return res.sendStatus(404);
  res.sendFile(filePath);
});

router.post("/public", authMiddleware, async (req, res) => {
  if (!req.body || !(req.body instanceof Array)) {
    return res.sendStatus(400);
  }
  const failed = asUser.publicfyFiles(req.session.uuid, req.body);
  if (!failed) return res.sendStatus(200);
  res.status(500).json(failed);
});

module.exports = router;
