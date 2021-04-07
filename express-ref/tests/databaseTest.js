console.log("DATABASE TESTING")
const db = require('../extensions/database.js');
let p = (data) => {console.log(data)};
db.init();
p(db.getUuid("admin"));
p(db.getUuid("notInDatabase"));
db.updateUserStorage(true);
p("validate password tests:");
p(db.validateCredentials("admin","fake"));
p(db.validateCredentials("badmin","fake"));
p(db.validateCredentials("admin","password"));
p(db.validateCredentials("badmin","password"));

// New User
p("\nUSER TESTING")
p(db.createUser("brad","jojo","abc@lol.com")); // someUUID
p(db.userExists("brad")); // true
p(db.userExists("fad")); // false
p(db.validateCredentials("brad","badpassword")); // false
p(db.validateCredentials("brad","jojo")); // true
let brad = db.getUuid("brad");
p(brad); // some UUID

p(db.getUuid("sad")) // undefined
// Brad Again
if(true){
p(db.createUser("brad","jojo","abc@lol.com")); // undefined, UsernameAlreadyExists
p(db.userUuidExists(brad)); // true
p(db.userUuidExists("this is not a valid UUID")); // false
p(db.getUserObject(brad)); // Object
p(db.getUserStorageSize(brad)); // some number
p(db.getUserEmail(brad)); // abc@lol.com
p(db.getUserImage(brad)); // /files/images/blank_user.svg
p(db.getUserGroups(brad)); // []
}


// User Files
// Brad will have 5 files, share 2 with Tim, who has 3 files
p("--TIM:")
let tim = db.createUser("tim","awefa","tim@abc.com");
p(tim) // new UUID
p(db.changeUsername(brad,"chad")) // true
p(db.changeUsername(brad,"tim")) // false
p(db.changePassword(brad,"chadchad")) // undefined
p(db.validateCredentials("chad","chadchad")) // true
p(db.userExists("brad")) // false
p(db.changeUsername(brad,"brad")) // true

p("\n--Files CHECKING ")

db.addFile("file1",brad);
db.addFile("file2",brad);
db.addFile("file3",brad);
let candy = db.addFile("candy",brad);
let cat = db.addFile("cat",brad);
p(db.fileExists(candy)); // true
p(db.fileExists(cat)); // true
p(db.fileExists("non legit uuid")) // false
//p(db.getFile(candy)); // Candy file object owned by braduuid
p(db.getFileOwnerUsername(candy)); // "chad"

let timfile = db.addFile("TIMS FILE",tim);
db.addFile("EFEF",tim);
db.addFile("Tim's personal stuff",tim);

p(db.authorizedToViewFile(cat,tim)); // false
p(db.authorizedToEditFile(candy,tim)); // false

p(db.authorizedToViewFile(candy,brad)); // true
p(db.authorizedToEditFile(cat,brad)); // true
p("\n--Sharing is caring")
db.shareFile(candy, {edit:false}, tim); // sharing candy file from brad to tim
db.shareFile(cat, {edit:true}, tim); // sharing cat file from brad to tim
p("after")
p(db.authorizedToViewFile(cat,tim)); // true
p(db.authorizedToEditFile(cat,tim)); // true
p(db.authorizedToViewFile(candy,tim)); // true
p(db.authorizedToEditFile(candy,tim)); // false

if(false){
p(db.getFile(candy))
p(db.getFile(cat))
p(db.getUserObject(tim))
p(db.getUserObject(brad))
}
p("mag")
let mag = db.createUser("mag","maggy","mag@abc.com");
db.shareFile(cat,{edit:true}, mag);
db.shareFile(candy,{edit:true},mag);
db.shareFile(cat,{edit:false},mag);
p(db.authorizedToViewFile(candy,tim)); // true
db.removeSharedUser(candy,tim);
p(db.authorizedToViewFile(candy,tim)); // false
p(db.authorizedToViewFile(candy,mag)); // true
db.removeSharedUser(candy,tim);
p(db.authorizedToViewFile(candy,mag)); // true
db.removeShare(candy);
p(db.authorizedToViewFile(candy,mag)); // false
p(db.authorizedToViewFile(candy,tim)); // false

p(db.getSharedInformation(candy)); // empty object
p(db.getSharedInformation(cat)); // 2 list with ids each
p(db.getOwnedFiles(brad)); // 5 files
p(db.getSharedFiles(mag)); // one file
p(db.getSharedFiles(tim)); // one file
p(db.deleteFile(cat)); // true
p(db.getOwnedFiles(brad)); // 4 files
p(db.getSharedFiles(mag)); // zero files
p(db.getSharedFiles(tim)); // zero files

p("\n-- GROUPS GALORE");
let ray = db.createUser("ray","rayisthebest","ray@ray.com");
let rg = db.createGroup(ray, "ray's cool group");
p(db.groupExists(rg));
p(db.getGroupName(rg)); // "ray's cool group'"
p(db.groupNameEdit("ray's group",rg)); // true
p(db.getGroupName(rg)); // "ray's group'"
p(db.getGroupOwner(rg)); // "ray" id
p(db.getGroupById(rg)); // object of group
p(db.getGroupUsers(rg)); // ray object

let gvf = db.addFile("groupView", ray);
let gef = db.addFile("groupEdit", ray);

db.shareGroupFile(gvf, {edit:false}, rg); // shares view file with group
db.shareGroupFile(gef, {edit:true}, rg); // shares edit file with group
p(db.getGroupFiles(rg))

p(db.authorizedToViewFile(gvf,tim)); // false
p(db.addUserToGroup(tim, rg, "viewer"));
p(db.addUserToGroup(mag, rg, "member"));
p("vfmatrix")

p(db.authorizedToViewFile(gvf,tim)); // true
p(db.authorizedToViewFile(gef,tim)); // true
p(db.authorizedToViewFile(gvf,mag)); // true
p(db.authorizedToViewFile(gef,mag)); // true

p(db.authorizedToEditFile(gvf,tim)); // false
p(db.authorizedToEditFile(gef,tim)); // false
p(db.authorizedToEditFile(gvf,mag)); // false
p(db.authorizedToEditFile(gef,mag)); // true

p(db.getGroupUsers(rg)); // List of json objects
p(db.getUserGroupPermission(tim,rg)); // "viewer"
p(db.getUserGroupPermission(mag,rg)); // "member"
p(db.getUserGroups(tim));
p(db.getFile(gvf)); // is in a group
p("removeFile: " + db.removeGroupFile(gvf,rg)); // removes file gvf from rg
p(db.authorizedToViewFile(gvf,mag)); // false
p(db.authorizedToViewFile(gef,mag)); // true
p(db.authorizedToViewFile(gvf,ray)); // true
p(db.getFile(gvf)); // is not in any groups

db.shareGroupFile(gvf, {edit:false}, rg);
p(db.authorizedToViewFile(gef,tim)); // true
p("removeUserFromGroup: " + db.removeUserFromGroup(tim,rg)); // removes tim from rg
p(db.getGroupUsers(rg));// Tim is not in the group
p(db.authorizedToViewFile(gef,tim)); // false
p(db.authorizedToViewFile(gef,mag)); // true
p(db.getUserGroups(tim)); // no groups

p(db.addUserToGroup(tim, rg, "manager")); // true
p(db.shareGroupFile(timfile,{edit:true},rg)); // true
p(db.shareFile(timfile,{edit:true},brad)); // true
p(timfile);
p(db.getSharedFiles(brad)); // should contain file
p(db.getGroupFiles(rg)); // should contain file
p(db.deleteUser(tim)); // deletes tim

p(db.getSharedFiles(brad)); // shouldn't contain file
p(db.getGroupFiles(rg)); // shouldn't contain file

//db.updateUserStorage(true);
