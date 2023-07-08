import * as fs from "fs";

const response = `
!API route!: /action/findOne
!API body!:
{
  "dataSource": "ai-app-builder",
  "database": "auto-backend",
  "collection": "user",
  "filter": {
    "email": "anothertest@gmail.com",
    "password": "def"
  }
}
!Updated schema!:
{
  "user": {
    "email": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "password": {
      "type": "string",
      "required": true,
      "unique": false
    }
  }
}`;

const apiHeadersRegex = /!API route!:([^]+)!API body!:/;
const apiHeadersMatch = response.match(apiHeadersRegex);
const endpointRegex = /\/.*/;
const apiEndpoint = apiHeadersMatch[1].trim().match(endpointRegex);
const remainingRoute = apiEndpoint ? apiEndpoint[0] : null;

// Extract API body
const apiBodyRegex = /!API body!:([\s\S]*?)!Updated schema!:/;
const apiBodyMatch = response.match(apiBodyRegex);
const apiBody = apiBodyMatch ? JSON.parse(apiBodyMatch[1].trim()) : null;

// Extract Updated Schema
const updatedSchemaRegex = /!Updated schema!:([\s\S]+)/;
const updatedSchemaMatch = response.match(updatedSchemaRegex);
const updatedSchema = updatedSchemaMatch
  ? JSON.parse(updatedSchemaMatch[1].trim())
  : null;

console.log(
  `LLM generated request:\nendpoint: ${remainingRoute}\nbody: ${JSON.stringify(
    apiBody
  )}\nupdatedSchema: ${JSON.stringify(updatedSchema)}\n`
);

// const schemaPath = "./lib/dataSchema.json";

// fs.writeFile(schemaPath, JSON.stringify(updatedSchema), (error) => {
//   if (error) {
//     console.error("Error writing to file:", error);
//   } else {
//     const existingSchema = fs.readFileSync(schemaPath, "utf8");
//     console.log(existingSchema);
//   }
// });

// const jsonString = `
// {
//   "Content-Type": "application/json",
//   "api-key": process.env.MONGO_DB_API_KEY
// }
// `

// console.log(JSON.parse(jsonString))
