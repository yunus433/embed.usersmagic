const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const indexPostController = require('../controllers/graphs/post');

router.post(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexPostController  
);

module.exports = router;
