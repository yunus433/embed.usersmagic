const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const demoGetController = require('../controllers/product/index/get');
const indexGetController = require('../controllers/product/demo/get');
const templatesIndexGetController = require('../controllers/product/templates/index/get');
const templatesDemoGetController = require('../controllers/product/templates/demo/get');

const createIndexPostController = require('../controllers/product/create/index/post');
const createDemoPostController = require('../controllers/product/create/demo/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/demo',
    demoGetController
);
router.get(
  '/templates',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    templatesIndexGetController
);
router.get(
  '/templates/demo',
    templatesDemoGetController
);

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createIndexPostController
);
router.post(
  '/create/demo',
    createDemoPostController
);

module.exports = router;
