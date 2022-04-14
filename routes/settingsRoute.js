const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const hasLeftWaitlist = require('../middleware/hasLeftWaitlist');
const isLoggedIn = require('../middleware/isLoggedIn');
const updateDemoData = require('../middleware/updateDemoData');

const teamIndexGetController = require('../controllers/settings/team/index/get');
const teamDemoGetController = require('../controllers/settings/team/demo/get');
const teamDeleteIndexGetController = require('../controllers/settings/team/delete/index/get');
const teamDeleteDemoGetController = require('../controllers/settings/team/delete/demo/get');

const passwordIndexPostController = require('../controllers/settings/password/index/post');
const passwordDemoPostController = require('../controllers/settings/password/demo/post');
const teamInviteIndexPostController = require('../controllers/settings/team/invite/index/post');
const teamInviteDemoPostController = require('../controllers/settings/team/invite/demo/post');
const updateIndexPostController = require('../controllers/settings/update/index/post');
const updateDemoPostController = require('../controllers/settings/update/demo/post');

router.get(
  '/team',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    teamIndexGetController
);
router.get(
  '/team/demo',
    updateDemoData,
    teamDemoGetController
);
router.get(
  '/team/delete',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    teamDeleteIndexGetController
);
router.get(
  '/team/delete/demo',
    updateDemoData,
    teamDeleteDemoGetController
);

router.post(
  '/password',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    passwordIndexPostController
);
router.post(
  '/password/demo',
    updateDemoData,
    passwordDemoPostController
);
router.post(
  '/team/invite',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    teamInviteIndexPostController
);
router.post(
  '/team/invite/demo',
    updateDemoData,
    teamInviteDemoPostController
);
router.post(
  '/update',
    isLoggedIn,
    isConfirmed,
    hasLeftWaitlist,
    updateIndexPostController
);
router.post(
  '/update/demo',
    updateDemoData,
    updateDemoPostController
);

module.exports = router;
