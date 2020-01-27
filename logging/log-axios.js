const { debug: debugFactory } = require("encharge-cloudwatch-log");
const _ = require("lodash");

const debug = debugFactory("axios");
require("axios-debug-log")({
  request(_unused, config) {
    debug(`Axios Request`, config);
  },
  response(_unused, response) {
    debug(`Axios Response:`, _.omit(response, "request"));
  },
  error(_unused, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug("Axios Error: ", _.omit(error, "request"));
  }
});
