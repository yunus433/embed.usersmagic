const async = require('async');
const mongoose = require('mongoose');

const deleteImage = require('./functions/deleteImage');
const uploadImage = require('./functions/uploadImage');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_ITEM_COUNT_PER_CRON_JOB = 1e2;

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: {
    type: String,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true,
    unique: true,
    image: true
  },
  exp_date: {
    type: Number,
    required: true
  },
  is_used: {
    type: Boolean,
    default: false
  }
});

ImageSchema.statics.createImage = function (data, callback) {
  const Image = this;

  if (!data.file_name)
    return callback('bad_request');

  uploadImage(data.file_name, (err, url) => {
    if (err) return callback('aws_database_error');

    const newImageData = {
      url,
      exp_date: (new Date).getTime() + ONE_DAY_IN_MS
    };

    const newImage = new Image(newImageData);

    newImage.save((err, image) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null, image.url);
    });
  });
};

ImageSchema.statics.findImageByUrl = function (url, callback) {
  const Image = this;

  if (!url || typeof url != 'string')
    return callback('bad_request');

  Image.findOne({
    url: url.trim()
  }, (err, image) => {
    if (err) return callback('database_error');
    if (!image) return callback('document_not_found');

    return callback(null, image);
  });
}

ImageSchema.statics.findImageByUrlAndDelete = function (url, callback) {
  const Image = this;

  Image.findImageByUrl(url, (err, image) => {
    if (err) return callback(err);

    deleteImage(image.url, err => {
      if (err) return callback('aws_database_error');
  
      Image.findByIdAndDelete(mongoose.Types.ObjectId(image._id.toString())  , err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

ImageSchema.statics.findExpiredImagesAndDelete = function (callback) {
  const Image = this;

  Image
    .find({
      is_used: false,
      exp_date: {$lt: (new Date()).getTime()}
    })
    .limit(MAX_ITEM_COUNT_PER_CRON_JOB)
    .then(images => {
      async.timesSeries(
        images.length,
        (time, next) => Image.findImageByUrlAndDelete(images[time].url, err => next(err)),
        err => {
          if (err) return callback(err);

          return callback(null);
        }
      );
    })
    .catch(err => {
      return callback(err);
    })
};

ImageSchema.statics.findImageByUrlAndSetAsUsed = function (url, callback) {
  const Image = this;

  Image.findImageByUrl(url, (err, image) => {
    if (err) return callback(err);

    if (image.is_used) return callback(null);

    Image.findByIdAndUpdate(mongoose.Types.ObjectId(image._id.toString()), {$set: {
      is_used: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Image', ImageSchema);
