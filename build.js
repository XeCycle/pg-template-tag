var fs = require("fs");
var babel = require("babel-core");

babel.transformFile("src.js", writeTo("index.js"));
babel.transformFile("test-src.js", writeTo("test.js"));

function writeTo(name) {
  return function writer(err, content) {
    if (err) throw err;
    fs.writeFile(name, content.code, function() {});
  };
}
