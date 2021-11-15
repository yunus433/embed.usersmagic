const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const deleteGetController = require('../controllers/target_groups/delete/get');
const indexGetController = require('../controllers/target_groups/index/get');

const createPostController = require('../controllers/target_groups/create/post');

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

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createPostController
);

module.exports = router;
