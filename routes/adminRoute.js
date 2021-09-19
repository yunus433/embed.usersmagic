const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');

const waitlistRemoveGetController = require('../controllers/admin/waitlist/remove/get');

const templatesCreatePostController = require('../controllers/admin/templates/create/post');

router.get(
  '/waitlist/remove',
    isAdmin,
    waitlistRemoveGetController
);

router.post(
  '/templates/create',
    isAdmin,
    templatesCreatePostController
);

module.exports = router;
