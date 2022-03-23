const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;

const status_values = ['showed', 'closed', 'clicked'];

const Schema = mongoose.Schema;

const AdDataSchema = new Schema({
  ad_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  person_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  person_id_list_length: {
    type: Number,
    default: 0
  }
});

AdDataSchema.statics.findAdDataById = function (id, callback) {
  const AdData = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  AdData.findById(mongoose.Types.ObjectId(id.toString()), (err, ad_data) => {
    if (err) return callback('database_error');
    if (!ad_data) return callback('document_not_found');

    return callback(null, ad_data);
  });
};

AdDataSchema.statics.findAdDataByAdIdAndGetAdStatistics = function (ad_id, callback) {
  const AdData = this;

  if (!ad_id || !validator.isMongoId(ad_id.toString()))
    return callback('bad_request');

  AdData.find({
    ad_id: mongoose.Types.ObjectId(ad_id.toString())
  }, (err, ad_datas) => {
    if (err) return callback('database_error');

    const statistics = {
      total: 0,
      showed: 0,
      closed: 0,
      clicked: 0
    };

    async.timesSeries(
      ad_datas.length,
      (time, next) => {
        if (ad_datas[time].status == 'showed')
          statistics.showed += ad_datas[time].person_id_list_length;
        else if (ad_datas[time].status == 'closed')
          statistics.closed += ad_datas[time].person_id_list_length;
        else if (ad_datas[time].status == 'clicked')
          statistics.clicked += ad_datas[time].person_id_list_length;
        else
          return next('unknown_error');

        statistics.total += ad_datas[time].person_id_list_length;

        return next(null);
      },
      err => {
        if (err) return callback(err);

        return callback(null, statistics);
      }
    );
  });
};

AdDataSchema.statics.findAdDataByAdIdAndDelete = function (ad_id, callback) {
  const AdData = this;

  if (!ad_id || !validator.isMongoId(ad_id.toString()))
    return callback('bad_request');

  AdData.find({
    ad_id: mongoose.Types.ObjectId(ad_id.toString())
  }, (err, ad_datas) => {
    if (err) return callback('database_error');

    async.timesSeries(
      ad_datas.length,
      (time, next) => AdData.findByIdAndDelete(ad_datas[time]._id, err => next(err)),
      err => {
        if (err) return callback(err);

        return callback(null);
      }
    );
  });
}

module.exports = mongoose.model('AdData', AdDataSchema);
