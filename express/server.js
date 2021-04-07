//Imports
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
//Local Imports
const { Web, StatusCode, Server } = require("./config.json");
//Import Routers
const stashRouter = require("./routes/stash");
const storage = require("./src/storage");
//Define Constants & Setup Database
const app = express();
const port = Server.Port;
const debuggingMode = Server.Debug;
const viewOptions = { beautify: false };

//Set Up Express session and View engine
app.use(session({ secret: uuidv4(), saveUninitialized: false, resave: false }));
app.use(bodyParser.json({ limit: Server.BodyLimit })); // parse application/json
app.use(bodyParser.urlencoded({ limit: Server.BodyLimit, extended: false })); // parse application/x-www-form-urlencoded
app.use(cors());
//Test if there is a
app.use("/api/stash", stashRouter);
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
    console.log("Recieved Shutdown Signal!");
    process.exit();
  });
  setInterval(() => storage.cleanZips(), Server.ZipRemovalInterval)
};
startServer();
