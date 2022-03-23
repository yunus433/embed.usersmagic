const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const AdData = require('../ad_data/AdData');
const Company = require('../company/Company');
const Image = require('../image/Image');
const IntegrationPath = require('../integration_path/IntegrationPath');
const Person = require('../person/Person');
const TargetGroup = require('../target_group/TargetGroup');

const getAd = require('./functions/getAd');

const DATABASE_CREATED_AT_LENGTH = 10;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH = 150;
const MAX_AD_COUNT_PER_COMPANY = 1e2;

const Schema = mongoose.Schema;

const AdSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  order_number: {
    type: Number,
    required: true,
    index: true
  },
  name: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true
  },
  title: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH,
    required: true
  },
  text: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH,
    required: true
  },
  button_text: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH,
    required: true
  },
  button_url: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true
  },
  image_url: {
    type: String,
    minlength: 0,
    maxlenght: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true
  },
  target_group_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  integration_path_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: String,
    required: true,
    length: DATABASE_CREATED_AT_LENGTH
  }
});

AdSchema.statics.findAdById = function (id, callback) {
  const Ad = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Ad.findById(mongoose.Types.ObjectId(id.toString()), (err, ad) => {
    if (err) return callback('database_error');
    if (!ad) return callback('document_not_found');

    return callback(null, ad);
  });
};

AdSchema.statics.findAdByIdAndFormat = function (id, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);

    getAd(ad, (err, ad) => {
      if (err) return callback(err);

      return callback(null, ad);
    });
  });
};

AdSchema.statics.createAd = function (data, callback) {
  const Ad = this;

  if (!data)
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.length || data.name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.length || data.title.length > MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.text || typeof data.text != 'string' || !data.text.length || data.text.length > MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.button_text || typeof data.button_text != 'string' || !data.button_text.length || data.button_text.length > MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.button_url || typeof data.button_url != 'string' || !data.button_url.length || data.button_url.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.integration_path_id_list || !Array.isArray(data.integration_path_id_list) || !data.integration_path_id_list.length)
    return callback('bad_request');

  if (!data.created_at || typeof data.created_at != 'string' || data.created_at.length != DATABASE_CREATED_AT_LENGTH)
    return callback('bad_request');

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    Image.findImageByUrl(data.image_url, (err, image) => {
      if (err) return callback(err);

      Ad.findAdsCountByCompanyId(company._id, (err, count) => {
        if (err) return callback(err);
        if (count >= MAX_AD_COUNT_PER_COMPANY)
          return callback('too_many_documents');

        TargetGroup.findTargetGroupById(data.target_group_id, (err, target_group) => {
          if (err) return callback(err);

          async.timesSeries(
            data.integration_path_id_list.length,
            (time, next) => IntegrationPath.findIntegrationPathById(data.integration_path_id_list[time], (err, integration_path) => {
              if (err) return next(err);

              return next(null, integration_path._id.toString());
            }),
            (err, integration_path_id_list) => {
              if (err) return callback(err);

              const newAdData = {
                company_id: company._id,
                order_number: count,
                name: data.name.trim(),
                title: data.title.trim(),
                text: data.text.trim(),
                button_text: data.button_text.trim(),
                button_url: data.button_url.trim(),
                image_url: image.url,
                target_group_id: target_group._id,
                integration_path_id_list,
                created_at: data.created_at.trim()
              };
          
              const newAd = new Ad(newAdData);
          
              newAd.save((err, ad) => {
                if (err) return callback('database_error');
      
                Image.findImageByUrlAndSetAsUsed(ad.image_url, err => {
                  if (err) return callback(err);
      
                  return callback(null, ad._id.toString());
                });        
              });
            }
          );
        });
      });
    }); 
  });
};

AdSchema.statics.findAdsByCompanyId = function (company_id, callback) {
  const Ad = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Ad
      .find({
        company_id: company._id
      })
      .sort({ order_number: 1 })
      .then(ads => async.timesSeries(
        ads.length,
        (time, next) => Ad.findAdByIdAndFormat(ads[time]._id, (err, ad) => {
          if (err) return next(err);

          return next(null, ad);
        }),
        (err, ads) => {
          if (err) return callback(err);

          return callback(null, ads);
        }
      ))
      .catch(err => callback('database_error'));
  });
};

AdSchema.statics.findAdsCountByCompanyId = function (company_id, callback) {
  const Ad = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Ad
      .find({
        company_id: company._id
      })
      .countDocuments()
      .then(count => callback(null, count))
      .catch(err => callback('database_error'));
  });
};

AdSchema.statics.findAdByIdAndCompanyIdAndDelete = function (id, company_id, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);
    if (ad.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    AdData.findAdDataByAdIdAndDelete(ad._id, err => {
      if (err) return callback(err);

      Ad.findByIdAndDelete(ad._id, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

AdSchema.statics.findTargetGroupByIdAndCompanyIdAndDelete = function (id, company_id, callback) {
  const Ad = this;

  TargetGroup.findTargetGroupById(id, (err, target_group) => {
    if (err) return callback(err);
    if (target_group.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Ad.findOne({
      target_group_id: target_group._id
    }, (err, ad) => {
      if (err) return callback('database_error');
      if (ad) return callback('document_still_used');

      TargetGroup.deleteTargetGroupById(target_group._id, err => {
        if (err) return callback(err);
  
        return callback(null);
      });
    });
  });
};

AdSchema.statics.findAdByIdAndCompanyIdAndDeactivate = function (id, company_id, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);
    if (ad.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Ad.findByIdAndUpdate(ad._id, {$set: {
      is_active: false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AdSchema.statics.findAdByIdAndCompanyIdAndActivate = function (id, company_id, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);
    if (ad.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Ad.findByIdAndUpdate(ad._id, {$set: {
      is_active: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AdSchema.statics.findAdByIdAndGetIntegrationPathList = function (id, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);

    async.timesSeries(
      ad.integration_path_id_list.length,
      (time, next) => IntegrationPath.findIntegrationPathById(ad.integration_path_id_list[time],
        (err, integration_path) => next(err, integration_path)
      ),
      (err, integration_path_list) => {
        if (err) return callback(err);

        return callback(null, integration_path_list);
      }
    );
  });
};

AdSchema.statics.findAdByIdAndUpdateIntegrationPathIdList = function (id, data, callback) {
  const Ad = this;

  Ad.findAdById(id, (err, ad) => {
    if (err) return callback(err);

    if (!data || !data.integration_path_id_list || !Array.isArray(data.integration_path_id_list))
      return callback('bad_request');

    Company.findCompanyById(ad.company_id, (err, company) => {
      if (err) return callback(err);

      async.timesSeries(
        data.integration_path_id_list.length,
        (time, next) => IntegrationPath.findIntegrationPathById(data.integration_path_id_list[time], (err, integration_path) => {
          if (err) return next(err);
          if (integration_path.company_id.toString() != company._id.toString())
            return next('not_authenticated_request');

          return next(null, integration_path._id.toString());
        }),
        (err, integration_path_id_list) => {
          if (err) return callback(err);

          Ad.findByIdAndUpdate(ad._id, {$set: {
            integration_path_id_list
          }}, err => {
            if (err) return callback(err);

            return callback(null);
          });
        }
      );
    });
  });
};


module.exports = mongoose.model('Ad', AdSchema);
