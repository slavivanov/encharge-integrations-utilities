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

// Figure out which is the OAS definition file
// const argv = require('minimist')(process.argv.slice(2));
const filename = process.argv[2] || "definitions/resolved.api.oas3.json";
const filepath = path.resolve(process.cwd(), filename);
let schema = require(filepath);

const getAPIGateway = async client => {
  try {
    // we assume that the apigateway endpoint file exists in the dir
    // where the script was called from
    const apiGatewayEndpoint = fs
      .readFileSync(path.resolve(process.cwd(), "apiGatewayEndpoint.txt"))
      .toString();

    if (!apiGatewayEndpoint) {
      throw new Error("Missing API Gateway endpoint");
    }
    schema.servers = [
      {
        url: apiGatewayEndpoint
      }
    ];
  } catch (e) {
    // Try to get the currently set endpoint
    const result = await client.query(`SELECT data FROM services WHERE id=$1`, [
      process.env.SERVICE_NAME
    ]);
    if (
      result &&
      result.rows &&
      result.rows[0] &&
      result.rows[0].data &&
      result.rows[0].data.schema &&
      result.rows[0].data.schema.servers &&
      result.rows[0].data.schema.servers[0] &&
      result.rows[0].data.schema.servers[0].url
    ) {
      schema.servers = [
        {
          url: result.rows[0].data.schema.servers[0].url
        }
      ];
    }
  }
};

schema = fixSchema(schema);
const perform = async () => {
  try {
    await client.connect();
    await getAPIGateway(client);
    const query = `INSERT INTO services (id, name, "humanName", "data") 
    VALUES ($1::text, $1::text, $1::text, $2)
    ON CONFLICT (id) DO UPDATE 
      SET data = services.data || $2 `;
    const query = `UPDATE services
        SET data = data || $2
        WHERE services.name = $1::text`;
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
