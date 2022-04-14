const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

const deleteIndexGetController = require('../controllers/integration/delete/index/get');
const deleteDemoGetController = require('../controllers/integration/delete/demo/get');
const demoGetController = require('../controllers/integration/demo/get');
const indexGetController = require('../controllers/integration/index/get');
const productIndexGetController = require('../controllers/integration/product/index/get');
const productDemoGetController = require('../controllers/integration/product/demo/get');

const createIndexPostController = require('../controllers/integration/create/index/post');
const createDemoPostController = require('../controllers/integration/create/demo/post');

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
  '/product',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    productIndexGetController
);
router.get(
  '/product/demo',
    updateDemoData,
    productDemoGetController
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
