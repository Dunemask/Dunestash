const express = require("express");
const path = require("path");
const fs = require("fs");
//Local Imports & Configs
const asUser = require("../src/user");
const upload = require("../src/upload");
//Establish path and create router
/** Absolute Router Path /api/stash*/
const router = express.Router();
const authMiddleware = (req, res, next) => {
  //  if (req.session.uuid==null) res.sendStatus(401);
  req.session.uuid = "fa-dunemask";
  asUser.bypassLogin(req.session.uuid);
  next();
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
  if (req.session.uuid == null) return res.sendStatus(401);
  if (req.query.zipTarget) {
    const zipPath = asUser.getZip(req.session.uuid, req.query.zipTarget);
    if (zipPath == null) return res.sendStatus(404);
    res.download(zipPath);
  }
});

router.post("/download", authMiddleware, async (req, res) => {
  if (!req.body || !(req.body instanceof Array)) {
    return res.sendStatus(400);
  }
  asUser
    .requestZip(req.session.uuid, req.body)
    .then((zipUuid) => {
      res.json(zipUuid);
    })
    .catch((e) => {
      res.sendStatus(500);
    });
  //Single Download
});

router.get("/raw", (req, res) => {
  if (!req.query || !req.query.target) return res.sendStatus(404);
  const filePath = asUser.getFilePath(req.session.uuid, req.query.target);
  if (!filePath) return res.sendStatus(404);
  res.sendFile(filePath);
});

module.exports = router;
