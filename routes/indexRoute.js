const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/index/index/get');
const waitlistGetController = require('../controllers/index/waitlist/get');

const graphsPostController = require('../controllers/index/graphs/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/waitlist',
    isLoggedIn,
    isConfirmed,
    waitlistGetController
);

router.post(
  '/graphs',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    graphsPostController
);

module.exports = router;
