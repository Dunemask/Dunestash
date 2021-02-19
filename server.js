//Imports
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const db = require("./database.js");
const ath = require("./athenuem.js");
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
app.use(bodyParser.json({ limit: "50mb" })); // parse application/json
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false })); // parse application/x-www-form-urlencoded
//Test if there is a userId
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
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "MainPage",
  });
});
app.get("/upload", isUser, (req, res) => {
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "UploadFilesPage",
  });
});
app.get("/files", isUser, (req, res) => {
  let title, displayFiles, filenames, splitFile;
  console.log(`Rendering Files For ${db.getUser(req.session.user_id)}:`);
  displayFiles = [];
  if (req.query.type == "linked") {
    title = "Linked Files";
    filenames = db.getLinkedFiles(req.session.user_id);
    Object.keys(filenames).forEach((filename) => {
      fileString = filename.slice(0, filename.lastIndexOf("-"));
      dateExtensionString = filename.slice(filename.lastIndexOf(fileString) + 1);
      date = ath.easyDate(dateExtensionString.slice(filename.lastIndexOf("-"),dateExtensionString.indexOf('.')));
      if(date!=""){
        fileString+=dateExtensionString.slice(dateExtensionString.indexOf('.'),dateExtensionString.length);
      }else{
        fileString = filename;
      }
      displayFiles.push({
        nemo: filenames[filename],
        target: filename,
        filename: fileString,
        date,
      });
    });
  } else {
    title = "Files";
    filenames = db.getOwnedFiles(req.session.user_id);
    Object.keys(filenames).forEach((filename) => {
      fileString = filename.slice(0, filename.lastIndexOf("-"));
      dateExtensionString = filename.slice(filename.lastIndexOf(fileString) + 1);
      date = ath.easyDate(dateExtensionString.slice(filename.lastIndexOf("-"),dateExtensionString.indexOf('.')));
      fileString+=dateExtensionString.slice(dateExtensionString.indexOf('.'),dateExtensionString.length);
      displayFiles.push({
        nemo: req.session.user_id,
        target: filename,
        filename: fileString,
        date,
      });
    });
  }
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "FilesPage",
    displayFiles,
    title,
  });
});
app.get("/share", isUser, (req, res) => {
  if (
    db.authorizedToEditFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "Share",
    });
  } else {
    res.redirect(req.header("Referer") || "/");
  }
});
//File Actions
app.post("/upload", isUser, (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);
  let approved;
  ath.userUpload(req, res, (err) => {
    approved = ath.approveFile(req); //Ensure the file gets passed
    if (!req.file || err) {
      console.log("ERROR!");
      console.log(err);
      approved.status = "ERROR";
      approved.statusTitle = "File Upload Error!";
    } else {
      db.addFile(req.file.filename, req.session.user_id);
    }
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UploadFilesPage",
      currentStatus: approved.status,
      currentStatusTag: approved.statusTitle,
    });
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
app.post("/groupedit", isUser, (req, res) => {
  db.groupEditFriendly(req.body.groupName, req.body.gid, req.session.user_id);
  res.redirect(req.header("Referer") || "/");
});
app.post("/share", isUser, (req, res) => {
  if (
    db.authorizedToEditFile(
      req.query.nemo,
      req.query.target,
      req.session.user_id
    )
  ) {
    let sharedSuccessfully = db.shareFile(
      req.body.file,
      req.body.options,
      req.session.user_id
    );
    let redirect = sharedSuccessfully
      ? req.header("Referer")
      : req.header("Referer") + "?error=1";
    res.redirect(redirect);
  } else {
    res.redirect("/not-authorized");
  }
});
//User Actions
app.get("/profile", isUser, (req, res) => {
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "UserProfilePage",
  });
});
app.get("/profile-password-change", isUser, (req, res) => {
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "PasswordChange",
  });
});
app.post("/profileImageUpload", isUser, (req, res) => {
  ath.imageUpload(req, res, (err) => {
    let status;
    let statusTag;
    let overrideImagePath;
    if (err || req.file == undefined) {
      status = "Error";
    }
    if (req.fileValidationError) {
      statusTag = "Only jpeg and png image types are accepted";
    }
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UserProfilePage",
      currentStatus: status,
      currentStatusTag: statusTag,
      userImage: db.getTemporaryUserImage(req.session.user_id),
    });
  });
});
app.post("/profileDetailsRevert", isUser, (req, res) => {
  db.removeTemporaryUserImage(req.session.user_id);
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "UserProfilePage",
    currentStatus: "Success",
    currentStatusTag: "Changes Reverted",
  });
});
app.post("/passwordChange", isUser, (req, res) => {
  let status;
  let statusTag;
  if (
    db.validateCredentialsOnUuid(req.session.user_id, req.body.originalPassword)
  ) {
    if (req.body.newPassword == req.body.confirmNewPassword) {
      db.changePassword(req.session.user_id, req.body.newPassword + "");
      statusTag = "Password Changed";
      status = "Success";
    } else {
      statusTag = "Passwords Don't Match";
      status = "Error";
    }
  } else {
    statusTag = "Original Password Incorrect";
    status = "Error";
  }
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "UserProfilePage",
    currentStatus: status,
    currentStatusTag: statusTag,
  });
});
app.post("/profileDetailsUpdate", isUser, (req, res) => {
  let overrideImagePath;
  let statusTag;
  let status;
  let username = db.getUser(req.session.user_id);
  let userImagesPath = "/www/files/images/user-images";
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
        function (err) {
          if (err) {
            statusTag = "Error Saving Image";
            status = "Error";
            console.error("ERROR: " + err);
          }
        }
      );
      overrideImagePath = "/files/images/user-images/" + req.session.user_id;
    } catch (err) {
      statusTag = "Error Saving Image";
      status = "Error";
      console.error(err);
    }
  }
  if (status == "Error") {
    //if status is defined we'll just render it and say there's an issue
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UserProfilePage",
      currentStatus: status,
      currentStatusTag: statusTag,
      overrideImagePath,
    });
  } else if (username.toLowerCase() != req.body.usernameField.toLowerCase()) {
    let newUsername = req.body.usernameField;
    newUsername = newUsername.charAt(0).toUpperCase() + newUsername.slice(1);
    let usernameTaken = db.changeUsername(req.session.user_id, newUsername);
    if (!usernameTaken) {
      statusTag = "Changes Saved!";
      status = "Success";
    } else {
      statusTag == "Username Taken!";
      status = "Error";
    }
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UserProfilePage",
      currentStatus: status,
      currentStatusTag: statusTag,
      overrideImagePath,
    });
  } else {
    statusTag = "Changes Saved";
    status = "Success";
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UserProfilePage",
      currentStatus: status,
      currentStatusTag: statusTag,
      overrideImagePath,
    });
  }
});
//Authentication
app.get("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect(req.header("Referer") || "/");
  if (req.session.returnTo) {
    delete req.session.returnTo;
  }
});
app.post("/logout", (req, res) => {
  res.redirect("/logout");
});
app.get("/login", (req, res) => {
  let status;
  let statusTag;
  //If there is an origin, redirect to origin once they're authenticated.
  //This means reload the page now that they're authorized
  if (req.query.origin) {
    req.session.returnTo = req.query.origin;
    if (req.session.user_id) {
      res.redirect(req.session.returnTo);
      return;
    }
  } else {
    req.session.returnTo = req.header("Referer");
  }
  if (req.query.loggedout) {
    statusTag = "Successfully Logged Out!";
    status = "Success";
  }
  if (req.query.attempt) {
    statusTag = "Username or Password Incorrect";
    status = "Error";
  }
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "LoginPage",
    currentStatus: status,
    currentStatusTag: statusTag,
  });
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
//Routing "Errors"
app.get("/page-not-found", (req, res) => {
  res.render("Portal.jsx", {
    userId: req.session.user_id,
    pageContent: "PageNotFound",
  });
});
app.get("/not-authorized", (req, res) => {
  if (req.session.user_id != undefined) {
    res.render("Portal.jsx", {
      userId: req.session.user_id,
      pageContent: "UserNotAuthenticated",
    });
  } else {
    res.redirect(`/login?origin=${req.query.origin || "/"}&loggedout=true`);
  }
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
