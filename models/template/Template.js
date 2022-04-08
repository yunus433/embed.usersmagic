const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getTemplate = require('./functions/getTemplate');

const type_values = ['demographics', 'brand', 'product'];
const subtype_values = ['yes_no', 'single', 'multiple', 'list', 'time', 'scale', 'number'];
const language_values = ['en', 'tr'];

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;
const DEFAULT_LANGUAGE_VALUE = 'en';

const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  timeout_duration_in_week: {
    type: Number,
    required: true
  },
  timeout_duration_in_week_by_choices: {
    type: Object,
    default: {}
  },
  order_number: {
    type: Number,
    required: true,
    index: true
  },
  language: {
    type: String,
    default: DEFAULT_LANGUAGE_VALUE
  },
  name: { // Escape character for product values: {}
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  text: { // Escape character for product values: {}
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  type: {
    type: String,
    required: true
  },
  subtype: {
    type: String,
    required: true
  },
  choices: {
    type: Array,
    default: []
  },
  min_value: {
    type: Number,
    default: null
  },
  max_value: { 
    type: Number,
    default: null
  },
  labels: {
    type: Object,
    default: {
      left: null,
      middle: null,
      right: null
    }
  }
});

TemplateSchema.statics.findTemplateById = function (id, callback) {
  const Template = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Template.findById(mongoose.Types.ObjectId(id.toString()), (err, template) => {
    if (err) return callback('database_error');
    if (!template) return callback('document_not_found');

    return callback(null, template);
  });
};

TemplateSchema.statics.findTemplateByIdAndFormat = function (id, callback) {
  const Template = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Template.findById(mongoose.Types.ObjectId(id.toString()), (err, template) => {
    if (err) return callback('database_error');
    if (!template) return callback('document_not_found');

    getTemplate(template, (err, template) => {
      if (err) return callback(err);

      return callback(null, template);
    });
  });
};

TemplateSchema.statics.findTemplatesByFiltersAndSorted = function (data, callback) {
  const Template = this;

  const filters = {};

  if (data.min_order_number && Number.isInteger(data.min_order_number))
    filters.order_number = { $gt: data.min_order_number };

  if (data.type && !Array.isArray(data.type) && type_values.includes(data.type.toString()))
    filters.type = data.type;
  else if (data.type && Array.isArray(data.type) && !data.type.find(each => !type_values.includes(each)))
    filters.type = data.type;

  if (data.language && !Array.isArray(data.language) && language_values.includes(data.language.toString()))
    filters.language = data.language;
  else if (data.language && Array.isArray(data.language) && !data.language.find(each => !language_values.includes(each)))
    filters.language = data.language;

  if (data.nin_id_list && Array.isArray(data.nin_id_list) && data.nin_id_list.length && !data.nin_id_list.find(each => !validator.isMongoId(each.toString())))
    filters._id = { $nin: data.nin_id_list.map(each => mongoose.Types.ObjectId(each.toString())) };

  Template
    .find(filters)
    .sort({ order_number: 1 })
    .then(templates => {
      async.timesSeries(
        templates.length,
        (time, next) => {
          const template = templates[time];

          getTemplate(template, (err, template) => {
            if (err) return next(err);
      
            return next(null, template);
          });
        },
        (err, templates) => {
          if (err) return callback(err);

          return callback(null, templates);
        }
      );
    })
    .catch(err => callback('database_error'));
};

module.exports = mongoose.model('Template', TemplateSchema);
