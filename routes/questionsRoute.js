const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

const activateIndexGetController = require('../controllers/questions/activate/index/get');
const activateDemoGetController = require('../controllers/questions/activate/demo/get');
const csvIndexGetController = require('../controllers/questions/csv/index/get');
const csvDemoGetController = require('../controllers/questions/csv/demo/get');
const deactivateIndexGetController = require('../controllers/questions/deactivate/index/get');
const deactivateDemoGetController = require('../controllers/questions/deactivate/demo/get');
const deleteIndexGetController = require('../controllers/questions/delete/index/get');
const deleteDemoGetController = require('../controllers/questions/delete/demo/get');
const formatIndexGetController = require('../controllers/questions/format/index/get');
const formatDemoGetController = require('../controllers/questions/format/demo/get');
const indexGetController = require('../controllers/questions/index/get');
const demoGetController = require('../controllers/questions/demo/get');
const integrateIndexGetController = require('../controllers/questions/integrate/index/get');
const integrateDemoGetController = require('../controllers/questions/integrate/demo/get');

const createIndexPostController = require('../controllers/questions/create/index/post');
const createDemoPostController = require('../controllers/questions/create/demo/post');
const integrateIndexPostController = require('../controllers/questions/integrate/index/post');
const integrateDemoPostController = require('../controllers/questions/integrate/demo/post');

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
  '/csv',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    csvIndexGetController
);
router.get(
  '/csv/demo',
    updateDemoData,
    csvDemoGetController
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
router.get(
  '/format',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    formatIndexGetController
);
router.get(
  '/format/demo',
    updateDemoData,
    formatDemoGetController
);
router.get(
  '/integrate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    integrateIndexGetController
);
router.get(
  '/integrate/demo',
    updateDemoData,
    integrateDemoGetController
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
router.post(
  '/integrate',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    integrateIndexPostController
);
router.post(
  '/integrate/demo',
    updateDemoData,
    integrateDemoPostController
);

module.exports = router;
