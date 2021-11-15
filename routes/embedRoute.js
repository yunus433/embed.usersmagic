const express = require('express');
const router = express.Router();

const isConfirmedDomain = require('../middleware/isConfirmedDomain');

const adGetController = require('../controllers/embed/ad/get');
const languageGetController = require('../controllers/embed/language/get');
const personGetController = require('../controllers/embed/person/get');
const questionGetController = require('../controllers/embed/question/get');

const answerPostController = require('../controllers/embed/answer/post');

router.get(
  '/ad',
    isConfirmedDomain,
    adGetController
);
router.get(
  '/language',
    isConfirmedDomain,
    languageGetController
);
router.get(
  '/person',
    isConfirmedDomain,
    personGetController
);
router.get(
  '/question',
    isConfirmedDomain,
    questionGetController
);

router.post(
  '/answer',
  isConfirmedDomain,
  answerPostController
);

module.exports = router;
