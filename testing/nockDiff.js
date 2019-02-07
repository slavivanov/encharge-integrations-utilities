const diff = require("jest-diff");

function nockDiff() {
  if (arguments.length === 1) {
    console.log(arguments);
  }
  try {
    const expectedBody = arguments[1];
    const receivedBody = JSON.parse(arguments[3]);
    console.log(diff(expectedBody, receivedBody));
  } catch (e) {}
}

module.exports = { nockDiff };