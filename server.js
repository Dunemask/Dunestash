//Imports
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const erv = require("express-react-views");
const path = require("path");
//Local Imports
const { Web, StatusCode, Server } = require("./server-config.json");
const db = require("./extensions/database.js");
db.init();
const r = require("./extensions/renderer.js");
const ath = require("./extensions/athenuem.js");
//Define Constants
const app = express();
const port = Server.Port;
const debuggingMode = Server.Debug;
const viewOptions = { beautify: false };
//Set Up Express session and View engine
app.use(session({ secret: uuidv4(), saveUninitialized: false, resave: false }));
app.use(express.static("www/", { dotfiles: "deny" }));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "jsx");
app.engine("jsx", erv.createEngine(viewOptions));
app.use(bodyParser.json({ limit: Server.BodyLimit })); // parse application/json
app.use(bodyParser.urlencoded({ limit: Server.BodyLimit, extended: false })); // parse application/x-www-form-urlencoded
//Test if there is a
const isUser = (req, res, next) => {
  if (debuggingMode && !req.session.user_id)
    req.session.user_id = db.getUuid("admin");
  if (!!req.session.user_id || req.path === "/login") {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect("login");
  }
};
//Router Requests
app.get("/", (req, res) => {
  res.redirect("/about");
});
app.get("/about", (req, res) => {
  r.loadPage(req, res, "pages/About.jsx");
});
app.get("/upload", isUser, (req, res) => {
  r.loadPage(req, res, "pages/Upload.jsx");
});
app.get("/my-files", isUser, (req, res) => {
  r.filesPage(req, res);
});
app.get("/share", isUser, (req, res) => {
  if (db.authorizedToEditFile(req.query.target, req.session.user_id)) {
    r.sharePage(req, res);
  } else {
    r.notAuthorized(req, res, req.session.lastPage);
  }
});
//File Actions
app.post("/upload", isUser, (req, res) => {
  r.fileUpload(req, res);
});
app.get("/download", isUser, (req, res) => {
  if (db.authorizedToViewFile(req.query.target, req.session.user_id)) {
    r.getDownload(req, res);
  } else {
    r.notAuthorized(req, res, "my-files");
  }
});
app.get("/rawdata", isUser, (req, res) => {
  if (db.authorizedToViewFile(req.query.target, req.session.user_id)) {
    r.getRawData(req, res);
  } else {
    r.notAuthorized(req, res, "my-files");
  }
});
app.get("/delete-file", isUser, (req, res) => {
  if (db.authorizedToEditFile(req.query.target, req.session.user_id)) {
    r.deleteFile(req, res);
  } else {
    r.notAuthorized(req, res, "my-files");
  }
});

app.post("/delete", isUser, (req, res) => {
  if (db.authorizedToEditFile(req.query.target, req.session.user_id)) {
    console.log("I SHOULD DELETE");
    console.log(req.body);
  } else {
    r.notAuthorized(req, res, "my-files");
  }
});
app.all("/groupedit", isUser, (req, res) => {
  throw new Error("I HAVE NOT BEEN CODED YET!!!");
  db.groupEditFriendly(req.body.groupName, req.body.gid, req.session.user_id);
  res.redirect(req.header("Referer") || "/");
});
app.post("/share", isUser, (req, res) => {
  if (db.authorizedToEditFile(req.query.target, req.session.user_id)) {
    r.shareUsingNames(req, res);
  } else {
    throw new Error("ERROR NEED CODE THIS");
    //r.loadPage(req,res,"pages/NotAuthorized.jsx");
  }
});
//User Actions
app.get("/profile", isUser, (req, res) => {
  if (req.query.type == "password") {
    r.loadPage(req, res, "pages/PasswordChange.jsx");
  } else {
    r.loadPage(req, res, "pages/Profile.jsx");
  }
});
app.post("/profile", isUser, (req, res) => {
  if (req.query.type == "image-upload") {
    r.profileImageUpdate(req, res);
  } else if (req.query.type == "apply-changes") {
    r.profileApplyUpdate(req, res);
  } else if (req.query.type == "password") {
    r.profilePasswordUpdate(req, res);
  } else {
    r.profileUpdateError(req, res);
  }
});
//Authentication && Registraation
app.all("/logout", (req, res) => {
  r.userLogout(req, res);
});
app.get("/login", (req, res) => {
  r.loadPage(req, res, "pages/Login.jsx");
});
app.post("/login", (req, res) => {
  r.checkLogin(req, res);
});
app.get("/register", (req, res) => {
  r.loadPage(req, res, "pages/Register.jsx");
});
app.post("/register", (req, res) => {
  r.register(req, res);
});
//Routing "Errors"
app.get("/page-not-found", (req, res) => {
  r.loadPage(req, res, "pages/Page404.jsx");
});
app.get("*", (req, res) => {
  res.redirect("/page-not-found");
});
//Serve App
const startServer = () => {
  server = app.listen(port, () => {
    console.log("Node version:" + process.versions.node);
    console.log(`Duneserver listening on port ${port}!`);
  });
  server.timeout = 10 * 60 * 1000;
  server.on("connection", (socket) => {
    // 10 minutes timeout
    socket.setTimeout(10 * 60 * 1000);
  });
  process.on("SIGINT", () => {
    console.log("Recieved Shutdown Signal - Updating Database");
    db.updateAllStorage();
    process.exit();
  });
  setInterval(() => {
    db.updateAllStorage();
  }, parseInt(Server.UpdateInterval)); //Update Users Json every hour
};
startServer();
