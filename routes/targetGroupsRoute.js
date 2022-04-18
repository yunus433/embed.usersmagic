const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

const deleteIndexGetController = require('../controllers/target_groups/delete/index/get');
const deleteDemoGetController = require('../controllers/target_groups/delete/demo/get');
const exportIndexGetController = require('../controllers/target_groups/export/index/get');
const exportDemoGetController = require('../controllers/target_groups/export/demo/get');
const indexGetController = require('../controllers/target_groups/index/get');
const demoGetController = require('../controllers/target_groups/demo/get');

const createIndexPostController = require('../controllers/target_groups/create/index/post');
const createDemoPostController = require('../controllers/target_groups/create/demo/post');

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
router.get(
  '/export',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    exportIndexGetController
);
router.get(
  '/export/demo',
    updateDemoData,
    exportDemoGetController
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
