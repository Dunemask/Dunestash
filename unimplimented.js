/* Unimplimented Requests
  app.get('/profile',validAuth,function(req,res){
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'UserProfilePage'});
});
app.get('/profile-password-change',validAuth,function(req,res){
  res.render('Portal.jsx', {userId:req.session.user_id,pageContent:'PasswordChange'});
});
*/
--------------------------------------------------------------------------------
/*        Unimplimented user Events
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


*/
