const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const createPostController = require('../controllers/product/create/post');

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    createPostController
);

module.exports = router;
