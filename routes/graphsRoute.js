const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const demoPostController = require('../controllers/graphs/demo/post');
const indexPostController = require('../controllers/graphs/index/post');

router.post(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexPostController  
);
router.post(
  '/demo',
    demoPostController  
);

module.exports = router;
