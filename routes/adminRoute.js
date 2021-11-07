const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');

const waitlistRemovePostController = require('../controllers/admin/waitlist/remove/post');
const templatesCreatePostController = require('../controllers/admin/templates/create/post');

router.post(
  '/templates/create',
    isAdmin,
    templatesCreatePostController
);
router.post(
  '/waitlist/remove',
    isAdmin,
    waitlistRemovePostController
);

module.exports = router;
