// Replace fields allowed in JSON schema, but not allowed in OAS
const _ = require("lodash");

function omitDeep(collection, excludeKeys) {
  function omitFn(value) {
    if (value && typeof value === "object") {
      excludeKeys.forEach(key => {
        // eslint-disable-next-line no-param-reassign
        delete value[key];
      });
    }
  }

  return _.cloneDeepWith(collection, omitFn);
}
function customizer(objValue, srcValue, key, object) {
  // console.log(objValue, srcValue, key, object);
  if (key === "x-endUserField") {
    // eslint-disable-next-line no-param-reassign
    object["encharge-ui"] = _.merge({}, objValue, srcValue);
  }
  if (key === "x-value") {
    // eslint-disable-next-line no-param-reassign
    object.value = _.merge({}, objValue, srcValue);
  }
}

const fixSchema = schema => {
  return omitDeep(_.mergeWith({}, schema, customizer), [
    "x-endUserField",
    "x-value"
  ]);
};
module.exports = fixSchema;
