const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/product/index/get');
const templatesGetController = require('../controllers/product/templates/get');

const createPostController = require('../controllers/product/create/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/templates',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    templatesGetController
);

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createPostController
);

module.exports = router;
