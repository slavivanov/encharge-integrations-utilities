const SwaggerParser = require("swagger-parser");
const fs = require("fs");

SwaggerParser.dereference(
  require("../definitions/resolved-external.api.oas3.json"),
  { circular: "ignore" },
  (err, res) => {
    if (err) {
      console.log(err);
      process.exitCode = 1;
      return;
    }
    fs.writeFile(
      "definitions/resolved.api.oas3.json",
      JSON.stringify(res, null, 2),
      er => {
        if (er) {
          console.log(er);
          process.exitCode = 1;
        }
      }
    );
  }
);
