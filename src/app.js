// App

const express = require('express'); // HTTP server
const morgan = require('morgan'); // HTTP logging
const helmet = require('helmet'); // secure HTTP headers

const { NODE_ENV } = require('./config');
const logger = require('./logger');
const bookmarksRouter = require('./bookmarksRouter');

const app = express();

// global middleware
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());

// routes
app.get('/', (req, res) => {
  res.send('Bookmarks Server');
});
app.use(bookmarksRouter);

// global error handler
app.use(function errorHandler(error, req, res, next) {
  logger.error(error);
  let response;
  if (NODE_ENV === 'production') response = { error: 'server error' };
  else response = { error: error.message };
  res.status(500).json(response);
});

module.exports = app;
