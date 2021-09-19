const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/index/index/get');
const waitlistGetController = require('../controllers/index/waitlist/get');

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

module.exports = router;