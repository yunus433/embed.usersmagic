const mongoose = require('mongoose');
const validator = require('validator');

const type_values = ['demographics', 'brand', 'product'];
const subtype_values = ['yes_no', 'single', 'multiple', 'list', 'scale', 'number'];

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;

const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  timeout_duration_in_week: {
    type: Number,
    required: true
  },
  order_number: {
    type: Number,
    required: true,
    index: true
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

  if (!data.timeout_duration_in_week || !Number.isInteger(data.timeout_duration_in_week))
    return callback('bad_request');

  if (!data.name || !data.text || !data.type || !data.subtype)
    return callback('bad_request');

  if (typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (typeof data.text != 'string' || !data.text.trim().length || data.text.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!type_values.includes(data.type))
    return callback('bad_request');

  if (!subtype_values.includes(data.subtype))
    return callback('bad_request');

  if (data.subtype == 'single' || data.subtype == 'multiple' || data.subtype == 'list') {
    choices = data.choices;

    if (!choices || !Array.isArray(choices) || choices.length > MAX_DATABASE_ARRAY_FIELD_LENGTH || !choices.length || choices.find(each => each.length > MAX_DATABASE_TEXT_FIELD_LENGTH))
      return callback('bad_request');
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
        name: data.name.trim(),
        text: data.text.trim(),
        type: data.type,
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

  if (data.type && type_values.includes(data.type))
    filters.type = data.type;

  if (data.type && Array.isArray(data.type) && !data.type.find(each => !type_values.includes(each)))
    filters.type = data.type;

  Template
    .find(filters)
    .sort({ order_number: 1 })
    .then(templates => callback(null, templates))
    .catch(err => callback('database_error'));
};

module.exports = mongoose.model('Template', TemplateSchema);
