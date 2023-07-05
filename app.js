import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { default as dbConnect } from './lib/dbConnect.js';
import initOpenAI from './lib/OpenAI.js';
import 'dotenv/config'

var app = express();

// CONNECT TO MONGODB
dbConnect();

// Instantiate a new openai api object
const openai = initOpenAI();


// view engine setup
const __dirname = path.resolve();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ONE SINGLE DYNAMIC ROUTE
app.post('/:name', async function(req, res) {
  const apiName = req.params.name;
  const chatCompletion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{role: "user", content: `Write an api route with this as the endpoint /${apiName}`}],
  })
  res.send(chatCompletion.data.choices[0].message.content);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
