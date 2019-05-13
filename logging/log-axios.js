const { debug: debugFactory } = require("encharge-cloudwatch-log");

const debug = debugFactory("axios");
require("axios-debug-log")({
  request(_, config) {
    debug(`Axios Request`, config);
  },
  response(_, response) {
    debug(`Axios Response:`, response);
  },
  error(_, error) {
    // Read https://www.npmjs.com/package/axios#handling-errors for more info
    debug("Axios Error: ", error);
  }
});
