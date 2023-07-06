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
    console.log(endpoint);
    const body = req.body;

    const bodyString = JSON.stringify(body, null, 2);
    const systemPrompt = getSystemPrompt(
      process.env.MONGO_DB_DATASOURCE,
      process.env.MONGO_DB_DATABASE
    );
    const existingSchema = fs.readFileSync(schemaPath, "utf8");
    const userPrompt = getUserPrompt(endpoint, bodyString, existingSchema);

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const response = chatCompletion.data.choices[0].message.content;

    // PARSE THE RESPONSE
    // Extract API route
    const apiRouteRegex = /!API route!: (.*?) (.*)/s;
    const apiRouteMatch = response.match(apiRouteRegex);
    const httpMethod = apiRouteMatch ? apiRouteMatch[1].trim() : null;
    const remainingRoute = apiRouteMatch ? apiRouteMatch[2].trim() : null;

    // Extract API headers
    const apiHeadersRegex = /!API headers!:(.*)/s;
    const apiHeadersMatch = response.match(apiHeadersRegex);
    const apiHeaders = apiHeadersMatch
      // ? JSON.parse(apiHeadersMatch[1].trim())
      // : null;

    // Extract API body
    const apiBodyRegex = /!API body!:(.*)/s;
    const apiBodyMatch = response.match(apiBodyRegex);
    const apiBody = apiBodyMatch
      // ? JSON.parse(apiBodyMatch[1].trim()) 
      // : null;

    // Extract Updated Schema
    const updatedSchemaRegex = /!Updated schema!:(.*)/s;
    const updatedSchemaMatch = response.match(updatedSchemaRegex);
    const updatedSchema = updatedSchemaMatch
      // ? JSON.parse(updatedSchemaMatch[1].trim())
      // : null;
    
    console.log(httpMethod, remainingRoute, apiHeaders, apiBody, updatedSchema)
    
    res.send(response);
    res.end();
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
