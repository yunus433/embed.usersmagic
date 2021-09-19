const express = require('express');
const router = express.Router();

const isConfirmedDomain = require('../middleware/isConfirmedDomain');

const connectionGetController = require('../controllers/embed/connection/get');
const personGetController = require('../controllers/embed/person/get');
const questionGetController = require('../controllers/embed/question/get');

const answerPostController = require('../controllers/embed/answer/post');

router.get(
  '/question',
    isConfirmedDomain,
    questionGetController
);
router.get(
  '/person',
    isConfirmedDomain,
    personGetController
);
router.get(
  '/connection',
    isConfirmedDomain,
    connectionGetController
);

router.post(
  '/answer',
  isConfirmedDomain,
  answerPostController
);

module.exports = router;
