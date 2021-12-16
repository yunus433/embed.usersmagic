const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const activatePostController = require('../controllers/integration/activate/post');
const createPostController = require('../controllers/integration/create/post');
const deactivatePostController = require('../controllers/integration/deactivate/post');
const deletePostController = require('../controllers/integration/delete/post');

router.post(
  '/activate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    activatePostController
);
router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createPostController
);
router.post(
  '/deactivate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deactivatePostController
);
router.post(
  '/delete',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deletePostController
);

module.exports = router;
