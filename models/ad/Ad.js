const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Answer = require('../answer/Answer');
const Company = require('../company/Company');
const Image = require('../image/Image');
const Person = require('../person/Person');
const Question = require('../question/Question');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH = 150;
const MAX_AD_COUNT_PER_COMPANY = 1e2;
const MAX_FILTER_COUNT_PER_AD = 100;

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
  filters: {
    type: Array,
    default: [],
    maxlength: MAX_FILTER_COUNT_PER_AD
  }
});

AdSchema.statics.findAdById = function (id, callback) {
  const Ad = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Ad.findById(mongoose.Types.ObjectId(id.toString()), (err, ad) => {
    if (err) return callback('database_error');
    if (!ad) return callback('document_not_found');

    return next(null, ad);
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

  if (!data.filters || !Array.isArray(data.filters) || data.filters.length > MAX_FILTER_COUNT_PER_AD)
    return callback('bad_request');

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    Image.findImageByUrl(data.image_url, (err, image) => {
      if (err) return callback(err);

      Ad.findAdsCountByCompanyId(company._id, (err, count) => {
        if (err) return callback(err);
        if (count >= MAX_AD_COUNT_PER_COMPANY)
          return callback('too_many_documents');

        async.timesSeries(
          data.filters.length,
          (time, next) => {
            const filter = filters[time];
            const newFilter = {};

            if (!filter.question_id || !filter.allowed_answers || !Array.isArray(filter.allowed_answers))
              return next('bad_request');

            Question.findQuestionByIdAndFormat(filter.question_id, (err, question) => {
              if (err) return next(err);

              newFilter.question_id = question._id.toString();
              newFilter.allowed_answers = filter.allowed_answers.map(each => each.trim()).filter(each => question.choices.includes(each));

              if (!newFilter.allowed_answers.length)
                return next('bad_request');

              return next(null, newFilter);
            });
          },
          (err, filters) =>{
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
              filters
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
      .then(ads => callback(null, ads))
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

AdSchema.statics.findAdByIdAndCheckIfPersonCanSee = function (data, callback) {
  const Ad = this;

  Ad.findAdById(data.ad_id, (err, ad) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);
      if (ad.company_id != company._id)
        return callback('not_authenticated_request');

      Person.findPersonById(data.person_id, (err, person) => {
        if (err) return callback(err);

        async.timesSeries(
          ad.filters.length,
          (time, next) => {
            const filter = filters[time];
  
            Answer.findOneAnswer({
              question_id: filter.question_id,
              answer_given_to_question: filter.allowed_answers,
              person_id: person._id
            }, err => {
              if (err && err == 'document_not_found') return next('process_complete');
              if (err) return next(err);
              
              return next(null);
            });
          },
          err => {
            if (err && err == 'process_complete') return callback(null, false);
            if (err) return callback(err);
  
            return callback(null, true);
          }
        );
      });
    });
  });
};

module.exports = mongoose.model('Ad', AdSchema);
