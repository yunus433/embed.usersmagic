const express = require('express');
const router = express.Router();

const isConfirmed = require('../middleware/isConfirmed');
const isLoggedIn = require('../middleware/isLoggedIn');

const checkGetController = require('../controllers/domain/check/get');
const deleteGetController = require('../controllers/domain/delete/get');

const updatePostController = require('../controllers/domain/update/post');

router.get(
  '/check',
    isLoggedIn,
    isConfirmed,
    checkGetController
);
router.get(
  '/delete',
    isLoggedIn,
    isConfirmed,
    deleteGetController
);

router.post(
  '/update',
    isLoggedIn,
    isConfirmed,
    updatePostController
);

module.exports = router;
