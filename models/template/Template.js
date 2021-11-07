const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getTemplate = require('./functions/getTemplate');

const type_values = ['demographics', 'brand', 'product']; // For now, all templates will be demographics
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
  is_default_template: {
    type: Boolean,
    default: false,
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
  subtype: {
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

TemplateSchema.statics.createTemplate = function (data, callback) {
  const Template = this;

  let choices = [];
  let min_value = null;
  let max_value = null;
  let labels = {
    left: null,
    middle: null,
    right: null
  };
  let timeout_duration_in_week_by_choices = null;

  if (!data.timeout_duration_in_week || !Number.isInteger(data.timeout_duration_in_week))
    return callback('bad_request');

  if (!data.name || !data.text || !data.type || !data.subtype)
    return callback('bad_request');

  if (typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (typeof data.text != 'string' || !data.text.trim().length || data.text.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!subtype_values.includes(data.subtype))
    return callback('bad_request');

  if (data.subtype == 'single' || data.subtype == 'multiple' || data.subtype == 'list' || data.subtype == 'time') {
    choices = data.choices;

    if (!choices || !Array.isArray(choices) || choices.length > MAX_DATABASE_ARRAY_FIELD_LENGTH || !choices.length || choices.find(each => each.length > MAX_DATABASE_TEXT_FIELD_LENGTH))
      return callback('bad_request');

    if (data.subtype == 'time' && data.timeout_duration_in_week_by_choices)
      timeout_duration_in_week_by_choices = data.timeout_duration_in_week_by_choices;
  }

  if (data.subtype == 'scale' || data.subtype == 'number') {
    min_value = data.min_value;
    max_value = data.max_value;

    if (!Number.isInteger(min_value) || !Number.isInteger(max_value) || min_value > max_value)
      return callback('bad_request');
  }

  if (data.subtype == 'scale') {
    if (data.labels && data.labels.left && typeof data.labels.left == 'string' && data.labels.left.length && data.labels.left.length < MAX_DATABASE_TEXT_FIELD_LENGTH)
      labels.left = data.labels.left;
    if (data.labels && data.labels.middle && typeof data.labels.middle == 'string' && data.labels.middle.length && data.labels.middle.length < MAX_DATABASE_TEXT_FIELD_LENGTH)
      labels.middle = data.labels.middle;
    if (data.labels && data.labels.right && typeof data.labels.right == 'string' && data.labels.right.length && data.labels.right.length < MAX_DATABASE_TEXT_FIELD_LENGTH)
      labels.right = data.labels.right;
  }

  Template
    .find()
    .countDocuments()
    .then(order_number => {
      const newTemplateData = {
        timeout_duration_in_week: data.timeout_duration_in_week,
        order_number,
        is_default_template: data.is_default_template ? true : false,
        language: data.language && language_values.includes(data.language) ? data.language : DEFAULT_LANGUAGE_VALUE,
        name: data.name.trim(),
        text: data.text.trim(),
        type: 'demographics',
        subtype: data.subtype,
        choices: choices,
        min_value: min_value,
        max_value: max_value,
        labels: labels
      };

      const newTemplate = new Template(newTemplateData);

      newTemplate.save((err, template) => {
        if (err) return callback('database_error');

        return callback(null, template._id.toString());
      });
    })
    .catch(err => callback('database_error'));
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

  if (data.is_default_template)
    filters.is_default_template = true;

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
