const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const activateGetController = require('../controllers/ads/activate/get');
const deactivateGetController = require('../controllers/ads/deactivate/get');
const deleteGetController = require('../controllers/ads/delete/get');
const indexGetController = require('../controllers/ads/index/get');

const createPostController = require('../controllers/ads/create/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/activate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    activateGetController
);
router.get(
  '/deactivate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deactivateGetController
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
