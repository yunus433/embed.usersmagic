const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

const activateIndexGetController = require('../controllers/ads/activate/index/get');
const activateDemoGetController = require('../controllers/ads/activate/demo/get');
const deactivateIndexGetController = require('../controllers/ads/deactivate/index/get');
const deactivateDemoGetController = require('../controllers/ads/deactivate/demo/get');
const deleteIndexGetController = require('../controllers/ads/delete/index/get');
const deleteDemoGetController = require('../controllers/ads/delete/demo/get');
const indexGetController = require('../controllers/ads/index/get');
const demoGetController = require('../controllers/ads/demo/get');

const createIndexPostController = require('../controllers/ads/create/index/post');
const createDemoPostController = require('../controllers/ads/create/demo/post');

router.get(
  '/',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    indexGetController
);
router.get(
  '/demo',
    updateDemoData,
    demoGetController
);
router.get(
  '/activate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    activateIndexGetController
);
router.get(
  '/activate/demo',
    updateDemoData,
    activateDemoGetController
);
router.get(
  '/deactivate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deactivateIndexGetController
);
router.get(
  '/deactivate/demo',
    updateDemoData,
    deactivateDemoGetController
);
router.get(
  '/delete',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    deleteIndexGetController
);
router.get(
  '/delete/demo',
    updateDemoData,
    deleteDemoGetController
);

router.post(
  '/create',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    createIndexPostController
);
router.post(
  '/create/demo',
    updateDemoData,
    createDemoPostController
);

module.exports = router;
