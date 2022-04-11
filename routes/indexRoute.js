const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const companyGetController = require('../controllers/index/company/get');
const demoGetController = require('../controllers/index/demo/get');
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
  '/company',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    companyGetController
);
router.get(
  '/demo',
    demoGetController
);
router.get(
  '/waitlist',
    isLoggedIn,
    isConfirmed,
    waitlistGetController
);

module.exports = router;
