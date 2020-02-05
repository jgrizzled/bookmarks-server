const express = require('express');
const cors = require('cors');
const isURL = require('validator/lib/isURL');
const uuid = require('uuid/v4');

const logger = require('./logger');
const validateBearerToken = require('./validateBearerToken');
const store = require('./store');

const bookmarksRouter = express.Router();

bookmarksRouter.use(cors());
bookmarksRouter.use(validateBearerToken);

bookmarksRouter
  .route('/bookmarks')
  .get((req, res) => {
    // return list of bookmarks

    res.json(store.bookmarks);
  })
  .post(express.json(), (req, res) => {
    // add bookmark, return id

    let { title, url, description = '', rating } = req.body;

    // validate title
    if (
      !(
        typeof title === 'string' &&
        // does not contain illegal characters
        title.match(/[^0-9a-zA-Z \-_!\?\.]/g) === null &&
        // isnt just spaces
        title.replace(/\s/g, '').length > 0
      )
    )
      return res.status(400).json({ error: 'invalid title' });

    // validate url
    if (!(typeof url === 'string' && isURL(url)))
      return res.status(400).json({ error: 'invalid url' });

    // validate description
    if (
      !(
        typeof description === 'string' &&
        // does not contain illegal characters
        description.match(/[^0-9a-zA-Z \-_!\?\.]/g) === null
      )
    )
      return res.status(400).json({ error: 'invalid description' });

    // validate rating
    rating = Number(rating);
    if (
      !(
        !isNaN(rating) &&
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5
      )
    )
      return res.status(400).json({ error: 'invalid rating' });

    const id = uuid();
    const bookmark = { id, title, url, description, rating };
    store.bookmarks.push(bookmark);
    logger.info('bookmark created with id ' + id);
    res
      .status(201)
      .location(`/bookmarks/${id}`)
      .json({ id });
  });

bookmarksRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    // send bookmark or 404

    const { id } = req.params;
    const bookmark = store.bookmarks.find(b => b.id === id);
    if (bookmark) res.json(bookmark);
    else res.status(404).json({ error: 'bookmark not found' });
  })
  .delete((req, res) => {
    // delete bookmark or 404

    const { id } = req.params;
    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === id);
    if (bookmarkIndex !== -1) {
      store.bookmarks.splice(bookmarkIndex, 1);
      logger.info('bookmark deleted with id ' + id);
      res.status(204).end();
    } else res.status(404).json({ error: 'bookmark not found' });
  });

module.exports = bookmarksRouter;
