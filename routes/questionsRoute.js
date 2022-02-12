const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');

const activateGetController = require('../controllers/questions/activate/get');
const csvGetController = require('../controllers/questions/csv/get');
const deactivateGetController = require('../controllers/questions/deactivate/get');
const deleteGetController = require('../controllers/questions/delete/get');
const indexGetController = require('../controllers/questions/index/get');
const integrateGetController = require('../controllers/questions/integrate/get');

const createPostController = require('../controllers/questions/create/post');
const integratePostController = require('../controllers/questions/integrate/post');

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
  '/csv',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    csvGetController
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
router.get(
  '/integrate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    integrateGetController
);

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createPostController
);
router.post(
  '/integrate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    integratePostController
);

module.exports = router;
