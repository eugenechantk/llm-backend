import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import initOpenAI from "./lib/OpenAI.js";
import "dotenv/config";
import { getUserPrompt, getSystemPrompt } from "./lib/prompts.js";
import * as fs from "fs";

const schemaPath = "./lib/dataSchema.json";
var app = express();

// Instantiate a new openai api object
const openai = initOpenAI();

// view engine setup
const __dirname = path.resolve();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ONE SINGLE DYNAMIC ROUTE
app.all("/*", async function (req, res) {
  try {
    const params = Object.values(req.params); // Get an array of all params
    const endpoint = `/${params.join("/")}`; // Join the params with '/'
    const body = req.body;

    const bodyString = JSON.stringify(body, null, 2);
    const systemPrompt = getSystemPrompt(
      process.env.MONGO_DB_DATASOURCE,
      process.env.MONGO_DB_DATABASE
    );
    const existingSchema = fs.readFileSync(schemaPath, "utf8");
    const userPrompt = getUserPrompt(endpoint, bodyString, existingSchema);

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const response = chatCompletion.data.choices[0].message.content;
    console.log(response);

    // PARSE THE RESPONSE
    // Extract API route
    const apiRouteRegex = /!API route!:(.+?)\n/m;
    const apiRouteMatch = response.match(apiRouteRegex);
    const apiRoute = apiRouteMatch[1].trim();
    const [httpMethod, remainingRoute] = apiRoute.split(" ");

    // Extract API body
    const apiBodyRegex = /!API body!:([\s\S]+?)\n\n/;
    const apiBodyMatch = response.match(apiBodyRegex);
    const apiBody = apiBodyMatch ? JSON.parse(apiBodyMatch[1].trim()) : null;

    // Extract Updated Schema
    const updatedSchemaRegex = /!Updated schema!:([\s\S]+)/;
    const updatedSchemaMatch = response.match(updatedSchemaRegex);
    const updatedSchema = updatedSchemaMatch
      ? JSON.parse(updatedSchemaMatch[1].trim())
      : null;

    console.log(
      `LLM generated request:\nmethod: ${httpMethod}\nendpoint: ${remainingRoute}\nbody: ${JSON.stringify(
        apiBody
      )}\nupdatedSchema: ${JSON.stringify(updatedSchema)}\n`
    );
    // MAKE THE MONGODB CALL
    const mongoAPIEndpoint = `${process.env.MONGO_DB_URL}${remainingRoute}`;
    const mongoAPIHeaders = {
      "Content-Type": "application/json",
      "api-key": process.env.MONGO_DB_API_KEY,
    };
    await fetch(mongoAPIEndpoint, {
      method: httpMethod,
      headers: mongoAPIHeaders,
      body: JSON.stringify(apiBody),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // WRITE THE SCHEMA BACK TO FILE
        fs.writeFile(schemaPath, JSON.stringify(updatedSchema), (error) => {
          if (error) {
            console.error('Error writing to file:', error);
          } else {
            console.log('Text has been written to the file successfully.');
          }
        });
        res.send(data);
        res.end();
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
