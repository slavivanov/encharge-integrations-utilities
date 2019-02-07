const SwaggerParser = require("swagger-parser");
const fs = require("fs");
const path = require("path");

// Figure out which is the OAS definition file
// const argv = require('minimist')(process.argv.slice(2));
const filename =
  process.argv[2] || "definitions/resolved-external.api.oas3.json";
const filepath = path.resolve(process.cwd(), filename);
let schema = require(filepath);

SwaggerParser.dereference(schema, { circular: "ignore" }, (err, res) => {
  if (err) {
    console.log(err);
    process.exitCode = 1;
    return;
  }
  fs.writeFile(
    path.resolve(process.cwd(), "definitions/resolved.api.oas3.json"),
    JSON.stringify(res, null, 2),
    er => {
      if (er) {
        console.log(er);
        process.exitCode = 1;
      }
    }
  );
});
