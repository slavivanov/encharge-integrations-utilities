// eslint-disable-next-line import/no-extraneous-dependencies
const { Client } = require("pg");
const fs = require("fs");
const fixSchema = require("./fixSchema");
// Uses the env postgres credentials. These must be set separately
const client = new Client();

if (!process.env.SERVICE_NAME) {
  throw new Error("Missing service name");
}
const apiGatewayEndpoint = fs.readFileSync("apiGatewayEndpoint.txt").toString();

if (!apiGatewayEndpoint) {
  throw new Error("Missing gateway endpoint");
}

let schema = require("../definitions/resolved.api.oas3.json");

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
