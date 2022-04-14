const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

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
    updateDemoData,
    demoPostController  
);

module.exports = router;
