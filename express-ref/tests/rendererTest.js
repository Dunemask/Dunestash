const r = require("../extensions/renderer.js");
const t = (data, length = 2) =>
  console.log("-".repeat(length) + `${data}` + "-".repeat(length));
const p = (data) => console.log(data);
t("RENDERER TESTS", 20);
t("Redirect Test", 20);
let req = "REQ";
let res = "RES";
let location = "Test";
let status = {type:"Success",tag:"NO"};
r.loadPage({ req, res,location, status, prop1, prop2});
p();
