const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const deleteGetController = require('../controllers/integration/delete/get');
const indexGetController = require('../controllers/integration/index/get');
const productGetController = require('../controllers/integration/product/get');

const createPostController = require('../controllers/integration/create/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/delete',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deleteGetController
);
router.get(
  '/product',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    productGetController
);

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createPostController
);

module.exports = router;