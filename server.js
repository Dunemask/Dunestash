//Imports
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const db = require("./database.js");
const ath = require("./athenuem.js");
const pr = require("./prerender.js");
//Define Constants
const app = express();
const port = 3000;
const debuggingMode = false;
const viewOptions = { beautify: false };
//Set Up Express session and View engine
app.use(
  session({ secret: "ssshhhhh", saveUninitialized: false, resave: false })
);
app.use(express.static("www/", { dotfiles: "deny" }));
app.set("views", __dirname + "/views");
app.set("view engine", "jsx");
app.engine("jsx", require("express-react-views").createEngine(viewOptions));
app.use(bodyParser.json({ limit: "5mb" })); // parse application/json
app.use(bodyParser.urlencoded({ limit: "5mb", extended: false })); // parse application/x-www-form-urlencoded
//Test if there is a
const isUser = (req, res, next) => {
  //req.session.user_id=0;
  if (req.session.user_id != undefined || req.path === "/login") {
    next();
  } else {
    res.redirect(`/login?origin=${req.originalUrl}`);
  }
};
//Router Requests
app.get("/", (req, res) => {
  res.render("pages/About.jsx", { uuid: req.session.user_id });
});
app.get("/upload", isUser, (req, res) => {
  res.render("pages/Upload.jsx", { uuid: req.session.user_id });
});
app.get("/files", isUser, (req, res) => {
  let linkedMode = req.query.type == "linked";
  let filePrerender = pr.filesPageRender(req.session.user_id, linkedMode);

  res.render("pages/Files.jsx", {
    uuid: req.session.user_id,
    displayFiles: filePrerender.displayFiles,
    linkedMode,
  });
});
app.get("/share", isUser, (req, res) => {
  if (
    req.query.nemo != undefined &&
    req.query.target != undefined &&
    db.authorizedToEditFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    let groups = db.getUserGroups(req.session.user_id);
    let fileDisplay = pr.fileDisplayBuilder(req.query.target);
    let displayFile = new pr.DisplayFile(
      req.query.nemo,
      req.query.target,
      fileDisplay.fileString,
      fileDisplay.date,
      pr.linkedOptions(req.query.nemo, req.query.target, req.session.user_id)
    );
    //pr.sharePageRender(req.session.user_id,req.query.nemo,req.query.target)
    res.render("pages/Share.jsx", {
      uuid: req.session.user_id,
      groups,
      displayFile,
    });
  } else {
    res.redirect("/not-authorized");
  }
});
//File Actions
app.post("/upload", isUser, (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);
  let approved;
  ath.userUpload(req, res, (err) => {
    let status = ath.approveFile(req); //Ensure the file gets passed
    if (!req.file || err) {
      console.log(err);
      status.type = "ERROR";
      status.tag = "File Upload Error!";
    } else {
      db.addFile(req.file.filename, req.session.user_id);
    }
    res.render("pages/Upload.jsx", { uuid: req.session.user_id, status });
  });
});
app.get("/download", isUser, (req, res) => {
  if (
    db.authorizedToViewFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    let path =
      __dirname + "/uploads/" + req.query.nemo + "/" + req.query.target;
    res.download(path);
  } else {
    res.redirect(req.header("Referer") || "/");
  }
});
app.get("/rawdata", isUser, (req, res) => {
  if (
    db.authorizedToViewFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    let path =
      __dirname + "/uploads/" + req.query.nemo + "/" + req.query.target;
    if (!req.query.target) {
      res.redirect("/");
    } else if (!fs.existsSync(path)) {
      res.redirect("/page-not-found?origin=" + req.originalUrl);
    } else {
      res.sendFile(path);
    }
  } else {
    res.redirect(req.header("Referer") || "/");
  }
});
app.get("/delete-file", isUser, (req, res) => {
  //delete-file?nemo=0&target=File1.txt
  if (
    db.authorizedToEditFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    try {
      fs.unlinkSync(
        `${__dirname}/uploads/${req.session.user_id}/${req.query.target}`
      );
      let deleted = db.deleteFile(req.query.target, req.session.user_id);
      console.log(`Deleted File ${req.query.target}: ${deleted}`);
      res.redirect("/files");
    } catch (err) {
      console.error(err);
    }
  } else {
    res.redirect(req.header("Referer") || "/");
  }
});
app.all("/groupedit", isUser, (req, res) => {
  db.groupEditFriendly(req.body.groupName, req.body.gid, req.session.user_id);
  res.redirect(req.header("Referer") || "/");
});
app.post("/share", isUser, (req, res) => {
  let unames = req.body["user-share-field"].replaceAll(" ", "");
  unames = unames.split(",");
  let uuid,
    shareFailed = false;
  if (
    db.authorizedToEditFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    for (const username of unames) {
      uuid = db.getUuid(username);
      if (uuid == undefined) {
        shareFailed = true;
      }
      if (shareFailed || !db.shareFile(req.body.file, req.body.options, uuid)) {
        shareFailed = true;
        break;
      }
    }
    let filePrerender = pr.filesPageRender(req.session.user_id, false);
    let status = {};
    status.type = shareFailed ? "Error" : "Success";
    status.tag = shareFailed
      ? "Error Sharing Requested Files (Did you type the usernames right?)"
      : "File has been successfully shared!";
    res.render("pages/Files.jsx", {
      uuid: req.session.user_id,
      displayFiles: filePrerender.displayFiles,
      status,
    });
  } else {
    res.redirect("/not-authorized");
  }
});
//User Actions
app.get("/profile", isUser, (req, res) => {
  if (req.query.type == "password") {
    res.render("pages/PasswordChange.jsx", { uuid: req.session.user_id });
  } else {
    res.render("pages/Profile.jsx", { uuid: req.session.user_id });
  }
});
app.post("/profile", isUser, (req, res) => {
  if (req.query.type == "image-upload") {
    profileImageUpdate(req, res);
  } else if (req.query.type == "apply-changes") {
    applyProfileUpdates(req, res);
  } else if (req.query.type == "password") {
    profilePasswordUpdate(req, res);
  } else {
    res.render("pages/Profile.jsx", {
      uuid: req.session.user_id,
      status: { type: "Error", tag: "Could not update your information." },
    });
  }
});
//Functions for updating information from the profile page, called by app.get("/profile")
const applyProfileUpdates = (req, res) => {
  let userImage;
  let username = db.getUser(req.session.user_id);
  let clientUsername = req.body["username-entry"];
  let status = {};
  const userImagesPath = "/www/files/images/user-images";
  if (
    fs.existsSync(__dirname + `${userImagesPath}/${req.session.user_id}-tmp`)
  ) {
    try {
      if (
        fs.existsSync(__dirname + `${userImagesPath}/${req.session.user_id}`)
      ) {
        fs.unlinkSync(__dirname + `${userImagesPath}/${req.session.user_id}`);
      }
      fs.rename(
        __dirname + `${userImagesPath}/${req.session.user_id}-tmp`,
        __dirname + `${userImagesPath}/${req.session.user_id}`,
        (err) => {
          if (err) {
            status.tag = "Error Saving Image";
            status.type = "Error";
            console.error("ERROR: " + err);
          }
        }
      );
      userImage = "/files/images/user-images/" + req.session.user_id;
    } catch (err) {
      status.tag = "Error Saving Image";
      status.type = "Error";
      console.error(err);
    }
  }
  if (status == "Error") {
    //if status is defined we'll just render it and say there's an issue
    res.render("pages/Profile.jsx", {
      uuid: req.session.user_id,
      status,
    });
  } else if (username.toLowerCase() != clientUsername.toLowerCase()) {
    let newUsername = clientUsername;
    newUsername = newUsername.charAt(0).toUpperCase() + newUsername.slice(1);
    let usernameTaken = db.changeUsername(req.session.user_id, newUsername);
    if (!usernameTaken) {
      status.tag = "Changes Saved!";
      status.type = "Success";
    } else {
      status.tag == "Username Taken!";
      status.type = "Error";
    }
    res.render("pages/Profile.jsx", {
      uuid: req.session.user_id,
      status,
      userImage,
    });
  } else {
    status.tag = "Changes Saved";
    status.type = "Success";
    res.render("pages/Profile.jsx", {
      uuid: req.session.user_id,
      status,
      userImage,
    });
  }
};
const profileImageUpdate = (req, res) => {
  let userImage,
    status = {};
  ath.imageUpload(req, res, (err) => {
    if (err || req.file == undefined) {
      status.type = "Error";
    }
    if (req.fileValidationError) {
      status.tag = "Only jpeg and png image types are accepted";
    }
    res.render("pages/Profile.jsx", {
      uuid: req.session.user_id,
      status,
      userImage: db.getTemporaryUserImage(req.session.user_id),
    });
  });
};
const profilePasswordUpdate = (req, res) => {
  let status = {};
  if (
    db.validateCredentialsOnUuid(
      req.session.user_id,
      req.body["original-password"]
    )
  ) {
    if (req.body["new-password"] == req.body["confirm-new-password"]) {
      db.changePassword(req.session.user_id, req.body["new-password"]);
      status.tag = "Password Changed";
      status.type = "Success";
    } else {
      status.tag = "Passwords Don't Match";
      status.type = "Error";
    }
  } else {
    status.tag = "Original Password Incorrect";
    status.type = "Error";
  }
  res.render("pages/PasswordChange.jsx", {
    uuid: req.session.user_id,
    status,
  });
};
//Authentication && Registraation
app.all("/logout", (req, res) => {
  delete req.session.user_id;
  if (req.session.returnTo) {
    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
  } else {
    res.redirect(req.header("Referer") || "/");
  }
});
app.get("/login", (req, res) => {
  let status = {};
  //If there is an origin, redirect to origin once they're authenticated.
  //This means reload the page now that they're authorized
  if (req.query.origin && !req.session.returnTo) {
    req.session.returnTo = req.query.origin;
    if (req.session.user_id) {
      res.redirect(req.session.returnTo);
      return;
    }
  } else {
    req.session.returnTo = req.header("Referer");
  }
  if (req.query.loggedout) {
    status.tag = "Successfully Logged Out!";
    status.type = "Success";
  }
  if (req.query.attempt) {
    status.tag = "Username or Password Incorrect";
    status.type = "Error";
  }
  res.render("pages/Login.jsx", { uuid: req.session.user_id, status });
});
app.post("/login", (req, res) => {
  let username = req.body.username ? req.body.username : undefined;
  let password = req.body.password;
  let isValid = db.validateCredentials(username, password);
  let returnTo = req.session.returnTo ? req.session.returnTo : "/";
  if (isValid) {
    req.session.user_id = db.getUuid(username);
    res.locals.user_id = req.session.user_id;
    delete req.session.returnTo;
  } else if (req.query.attempt == undefined) {
    returnTo = "login?attempt=true&origin=" + returnTo;
  }
  res.redirect(returnTo);
});
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.render("pages/About.jsx", {
      status: { type: "Error", tag: "You are already logged in!" },
    });
  } else {
    res.render("pages/Register.jsx");
  }
});
app.post("/register", (req, res) => {
  let status = {};
  if (
    req.body.username == undefined ||
    req.body.password == undefined ||
    req.body["confirm-password"] == undefined
  ) {
    status.type = "Error";
    status.tag = "Error: 1 or More Fields Empty!";
  } else if (db.getUuid(req.body.username) != undefined) {
    status.type = "Error";
    status.tag = "Username Already Taken!";
  } else if (req.body["confirm-password"] != req.body.password) {
    status.type = "Error";
    status.tag = "Passwords Don't Match!";
  } else if (req.body["confirm-password"] == req.body.password) {
    db.createUser(req.body.username, req.body.password);
    status.type = "Success";
    status.tag = "Account Successfully Created!";
  } else {
    status.type = "Error";
    status.tag = "Unknown Error Occurred!";
  }
  if (status.type == "Error") {
    res.render("pages/Register.jsx", { status });
  } else {
    req.session.returnTo = "/";
    res.render("pages/Login.jsx", { status });
  }
});

//Routing "Errors"
app.get("/page-not-found", (req, res) => {
  res.render("pages/Page404.jsx", { uuid: req.session.user_id });
});
app.get("/not-authorized", (req, res) => {
  if (!req.session.returnTo) {
    req.session.returnTo = `/login?origin=${req.query.origin}`;
  }
  res.render("pages/NotAuthorized.jsx", { uuid: req.session.user_id });
});
app.get("*", (req, res) => {
  res.redirect("/page-not-found");
});
//Serve App
startServer = () => {
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
  }, 60 * 60 * 1000); //Update Users Json every hour
};
startServer();
