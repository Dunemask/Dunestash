const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer  = require('multer')
const db= require('./database.js');
const ath = require('./athenuem.js');
//Define Constants
const app = express()
const port = 3000;
const debuggingMode = false;
const viewOptions = { beautify: false };
//Set Up Express session and View engine
app.use(session({secret: 'ssshhhhh',saveUninitialized: false,resave: false}));
app.use(express.static('www/', {dotfiles:'deny'} ))
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine(viewOptions));
app.use(bodyParser.json({limit: '50mb'})) // parse application/json
app.use(bodyParser.urlencoded({ limit:'50mb', extended: false})) // parse application/x-www-form-urlencoded
//Router Plain Requests
app.get('/', function (req, res) {
  console.log(req.session.user_id);
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'MainPage'});
});
app.get('/upload', validAuth,function (req, res){
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'UploadFilesPage'});
});
app.get('/profile',validAuth,function(req,res){
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'UserProfilePage'});
});
app.get('/profile-password-change',validAuth,function(req,res){
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'PasswordChange'});
});
//Upload Events
app.post('/upload',validAuth,function(req,res){
  req.socket.setTimeout(10 * 60 * 1000);
  let approved;
  ath.userUpload(req,res,function(err) {
     approved = ath.approveFile(req); //Ensure the file gets passed
     if(!req.file || err){
       console.log("ERROR!");
       console.log(err);
       res.redirect(req.header('Referer'));
       return;
     }else{
       db.addFile(req.file.filename,req.session.user_id);
     }

    res.render('Portal.jsx',{userId:req.session.user_id,
                            pageContent:'UploadFilesPage',
                            currentStatus:approved.status,
                            currentStatusTag:approved.statusTitle});
  });
});
//Userpage Events
app.post('/userImageUpload',validAuth,function(req,res){
    ath.imageUpload(req,res,function(err) {
      let status;
      let statusTag;
      let overrideImagePath;
      if(err || req.file==undefined){
        status ="Error";
      }
      if(req.fileValidationError){
        statusTag="Only jpeg and png image types are accepted"
      }
      overrideImagePath = status=="Error"?overrideImagePath:`/files/images/user-images/${req.session.user_id}-tmp`;
      res.render('Portal.jsx',{userId:req.session.user_id,
                              pageContent:'UserProfilePage',
                              currentStatus:status,
                              currentStatusTag:statusTag,
                              overrideImagePath});
    });
});
app.post('/passwordChange',validAuth,function(req,res){
    let status;
    let statusTag;
    if(db.validateCredentialsOnUuid(req.session.user_id,req.body.originalPassword)){
      if(req.body.newPassword==req.body.confirmNewPassword){
        db.changePassword(req.session.user_id,req.body.newPassword+"");
        statusTag="Password Changed"
        status="Success";
      }else{
        statusTag="Passwords Don't Match"
        status="Error";
      }
    }else{
      statusTag="Original Password Incorrect"
      status="Error";
    }
    res.render('Portal.jsx',{userId:req.session.user_id,
                            pageContent:'UserProfilePage',
                            currentStatus:status,
                            currentStatusTag:statusTag});
});
app.post('/fieldsChange',validAuth,function(req,res){
  let overrideImagePath;
  let statusTag;
  let status;
  let username = db.getUser(req.session.user_id);
  let userImagesPath='/www/files/images/user-images';
  if(fs.existsSync(__dirname+`${userImagesPath}/${req.session.user_id}-tmp`)){
    try {
        if(fs.existsSync(__dirname+`${userImagesPath}/${req.session.user_id}`)){
          fs.unlinkSync(__dirname+`${userImagesPath}/${req.session.user_id}`);
        }
        fs.rename(__dirname+`${userImagesPath}/${req.session.user_id}-tmp`,
                  __dirname+`${userImagesPath}/${req.session.user_id}`,
        function(err) {
            if ( err ){
              statusTag="Error Saving Image"
              status="Error";
              console.error('ERROR: ' + err);
            }
          });
        overrideImagePath='/files/images/user-images/'+req.session.user_id;
        }catch(err) {
          statusTag="Error Saving Image"
          status="Error";
          console.error(err)
      }
    }
    if(status=="Error"){//if status is defined we'll just render it and say there's an issue
      res.render('Portal.jsx',{userId:req.session.user_id,
                              pageContent:'UserProfilePage',
                              currentStatus:status,
                              currentStatusTag:statusTag,
                              overrideImagePath});
    }else if(username.toLowerCase()!=req.body.usernameField.toLowerCase()){
      let newUsername=req.body.usernameField;
      newUsername=newUsername.charAt(0).toUpperCase() + newUsername.slice(1);
      let usernameTaken = db.changeUsername(req.session.user_id,newUsername);
      if(!usernameTaken){
        statusTag="Changes Saved!";
        status="Success";
      }else{
        statusTag=="Username Taken!";
        status="Error";
      }
      res.render('Portal.jsx',{userId:req.session.user_id,
                              pageContent:'UserProfilePage',
                              currentStatus:status,
                              currentStatusTag:statusTag,
                              overrideImagePath});
    }else{
      statusTag="Changes Saved";
      status="Success";
      res.render('Portal.jsx',{userId:req.session.user_id,
                              pageContent:'UserProfilePage',
                              currentStatus:status,
                              currentStatusTag:statusTag,
                              overrideImagePath});
    }
});
//Router Advanced Requests
app.get('/user-uploaded-files',validAuth,function (req, res){
  var files = fs.readdirSync(__dirname+'/uploads/'+req.session.user_id);
  let title=db.getUser(req.session.user_id).charAt(0).toUpperCase()
              + db.getUser(req.session.user_id).slice(1)+"'s Files";
  var ownedFiles = db.getOwnedFiles(req.session.user_id);
  let userGroups = db.getUserGroups(req.session.user_id);
  let linkedFiles = db.getLinkedFiles(req.session.user_id);
  console.log('Rendering Files:');
  console.log(ownedFiles);
  console.log(userGroups);
  console.log(linkedFiles);
  let downloadsPageProps = {
    title:'User Files',
    ownedFiles,
    userGroups,
    linkedFiles,
    userId:req.session.user_id}
    res.render('Portal.jsx',{userId:req.session.user_id,
                            pageContent:'DownloadsPage',
                            downloadsPageProps});
});
//Get Downloads
app.get('/get-user-uploads*', function (req,res){
  let uuidAndFile = req.originalUrl.substring(19,req.originalUrl.length);
  let uuid = uuidAndFile.substring(0,uuidAndFile.indexOf('/'));
  if (req.session.user_id!=uuid) {
    res.redirect('/not-authorized?origin=/get-user-uploads')
  } else {
    let file = __dirname+"/uploads/"+uuidAndFile;
    res.download(file);
  }
});
app.get('/download',validAuth,function(req,res){
  if(db.authorizedToViewFile(req.query.nemo,req.query.target,req.session.user_id)){
    let path = __dirname+"/uploads/"+req.query.nemo+"/"+req.query.target;
    res.download(path);
  }else{
    res.redirect(req.header('Referer') || '/');
  }
});
app.get('/rawdata',validAuth,function(req,res){
  if(db.authorizedToViewFile(req.query.nemo,req.query.target,req.session.user_id)){
    let path = __dirname+"/uploads/"+req.query.nemo+"/"+req.query.target;
    if(!req.query.target){
      res.redirect('/');
    }else if(!fs.existsSync(path)){
      res.redirect('/page-not-found?origin='+req.originalUrl);
    }else{
      res.sendFile(path);
    }
  }else{
    res.redirect(req.header('Referer') || '/');
  }
});
//Get Delete
app.get('/delete-file',validAuth,function (req,res){
  //delete-file?nemo=0&target=File1.txt
  if(db.authorizedToEditFile(req.query.nemo,req.query.target,req.session.user_id)){
    let deleted = db.deleteFile(req.query.target,req.session.user_id);
    console.log(`Deleted File ${req.query.target}: ${deleted}`);
    try {
      fs.unlinkSync(`${__dirname}/uploads/${req.session.user_id}/${req.query.target}`)
      res.redirect('/user-uploaded-files');
    } catch(err) {
      console.error(err)
    }
  }else{
    res.redirect(req.header('Referer') || '/');
  }
});
app.post('/groupedit',validAuth,function (req,res){
  db.groupEditFriendly(req.body.groupName,req.body.gid,req.session.user_id);
  res.redirect(req.header('Referer') || '/');
});
app.post('/sharefile', validAuth, function (req,res ){
  let sharedSuccessfully = db.shareFile(req.body.file,req.body.options,req.session.user_id);
  let redirect = sharedSuccessfully? req.header('Referer'):req.header('Referer')+'?error=1';
  res.redirect(redirect);
});
//Authentication
app.get('/logout',function(req,res){
  delete req.session.user_id;
  res.redirect(req.header('Referer') || '/');
  if (req.session.returnTo) {
    delete req.session.returnTo
  }
});
app.post('/logout',function(req,res){
  res.redirect('/logout');
});
app.post('/login',function(req,res){
  let username = req.body.username?req.body.username:undefined;
  let password = req.body.password;
  let isValid = db.validateCredentials(username,password);
  let returnTo = req.session.returnTo ? req.session.returnTo : '/'
  if(isValid){
      req.session.user_id = db.getUuid(username);
      res.locals.user_id=req.session.user_id;
      delete req.session.returnTo
  }else if(req.query.attempt==undefined){
    returnTo="login?attempt=true&origin="+returnTo;
  }
  res.redirect(returnTo);
});
app.get('/login', function (req, res) {
      let status;
      let statusTag;
      //If there is an origin, redirect to origin once they're authenticated.
      //This means reload the page now that they're authorized
      if(req.query.origin){
        req.session.returnTo = req.query.origin;
        if(req.session.user_id){
          res.redirect(req.session.returnTo);
          return;
        }
      }else{
        req.session.returnTo = req.header('Referer');
      }
      if (req.query.loggedout){
        statusTag="Successfully Logged Out!"
        status="Success"
      }
      if(req.query.attempt){
        statusTag="Username or Password Incorrect"
        status="Error"
      }
      res.render('Portal.jsx',{userId:req.session.user_id,
                              pageContent:'LoginPage',
                              currentStatus:status,
                              currentStatusTag:statusTag});
});
function validAuth(req, res, next) {
    //req.session.user_id=0;
    if (req.session.user_id!=undefined || req.path==='/login') {
        next();
    } else {
       res.redirect( `/login?origin=${req.originalUrl}` )
    }
}
//Server Handlers
app.get('/page-not-found',function(req,res){
  res.render('Portal.jsx',{userId:req.session.user_id,pageContent:'PageNotFound'});
});
app.get('/not-authorized',function(req,res){
    if (req.session.user_id!=undefined){
        res.render('Portal.jsx',{userId:req.session.user_id,pageContent:'UserNotAuthenticated'});
    }else{
      res.redirect(`/login?origin=${req.query.origin || '/'}&loggedout=true`);
    }
});
//Debugging mode Handler
if(!debuggingMode){
  app.get('*', function(req, res) {
      res.redirect('/page-not-found?origin='+req.originalUrl);
  });
  app.post('*', function(req, res) {
      res.redirect('/page-not-found?origin='+req.originalUrl);
  });
}
//Serve App
function startServer() {
    server = app.listen(port, function () {
        console.log('Node version:' + process.versions.node);
        console.log(`Duneserver listening on port ${port}!`);
    });
      server.timeout = 10 * 60 * 1000;
    server.on('connection', function(socket) {
        // 10 minutes timeout
        socket.setTimeout(10 * 60 * 1000);
    });

    process.on('SIGINT', function() {
        console.log("Recieved Shutdown Signal - Updating Database");
        db.updateAllStorage();
        process.exit();
    });
    setInterval(function(){db.updateAllStorage();}, 60*60*1000); //Update Users Json every hour
}
startServer();
