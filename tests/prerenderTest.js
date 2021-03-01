console.log("PRERENDER TESTING");
const db = require("../extensions/database.js");
const pr = require("../extensions/prerender.js");
const p = (data) => console.log(data);
db.init();
const user = db.createUser("Test", "Password");
db.addFile(Date.now() + "-ChimmyChongas", user);
const file = db.getFile(db.getOwnedFiles(user)[0]);
p("--Input File--");
p(file);
p("--End Input--");
//End Init
p("Result");
p(pr.fileDisplayBuilder(file.path));
p("Expected");
p({
  date: "M/D/Y HR:MN",
  fileString: "ChimmyChongas",
});
p("--Result--");
p(pr.filesPageRender(user, false));
p("--End Result--");
p("--Expected--");
p({
  title: "Files",
  displayFiles: [
    {
      nemo: "3800b12c-2162-47ba-989c-08024ff3d169",
      target: "5b9e4b45-6924-43b6-a25e-2ba456e5122b",
      filename: "ChimmyChongas",
      date: "M/D/Y HR:MN",
      options: "[Object]",
    },
  ],
});
p("--End Expected");
p("END PRERENDER TESTS");
