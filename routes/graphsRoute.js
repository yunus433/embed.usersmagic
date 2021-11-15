const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const filtersPostController = require('../controllers/graphs/filters/post');

router.post(
  '/filters',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    filtersPostController
);

module.exports = router;
