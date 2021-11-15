const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const isLoggedIn = require('../middleware/isLoggedIn');

const deleteGetController = require('../controllers/image/delete/get');

const uploadPostController = require('../controllers/image/upload/post');

router.get(
  '/delete',
    isLoggedIn,
    deleteGetController
);

router.post(
  '/upload',
    upload.single('file'),
    isLoggedIn,
    uploadPostController
)

module.exports = router;
