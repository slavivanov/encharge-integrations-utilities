// eslint-disable-next-line import/no-extraneous-dependencies
const { Client } = require("pg");
const fs = require("fs");
const fixSchema = require("./fixSchema");
const path = require("path");

// Uses the env postgres credentials. These must be set separately
const client = new Client();

if (!process.env.SERVICE_NAME) {
  throw new Error("Missing service name");
}
// we assume that the apigateway endpoint file exists in the dir
// where the script was called from
const apiGatewayEndpoint = fs
  .readFileSync(path.resolve(process.cwd(), "apiGatewayEndpoint.txt"))
  .toString();

if (!apiGatewayEndpoint) {
  throw new Error("Missing gateway endpoint");
}

// Figure out which is the OAS definition file
// const argv = require('minimist')(process.argv.slice(2));
const filename = process.argv[2] || "definitions/resolved.api.oas3.json";
const filepath = path.resolve(process.cwd(), filename);
let schema = require(filepath);

schema.servers = [
  {
    url: apiGatewayEndpoint
  }
];

schema = fixSchema(schema);
const perform = async () => {
  try {
    await client.connect();
    const query = `INSERT INTO services (id, name, "humanName", "data") 
    VALUES ($1::text, $1::text, $1::text, $2)
    ON CONFLICT (id) DO UPDATE 
      SET data = services.data || $2 `;
    // const query = `UPDATE services
    //     SET data = data || $2
    //     WHERE services.name = $1::text`;
    await client.query(query, [
      process.env.SERVICE_NAME,
      JSON.stringify({
        schema
      })
    ]);
    console.log(`✅  ${process.env.SERVICE_NAME} definition updated`);
  } catch (e) {
    console.log(e);
  }
  client.end();
};

perform();
