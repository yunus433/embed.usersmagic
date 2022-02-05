const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const type_values = ['page', 'product'];

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_INTEGRATION_PATH_COUNT = 1e4;

const IntegrationPathSchema = new Schema({
  signature: {
    type: String,
    required: true,
    unique: true
    // Format: company_id + name.toLocaleLowerCase().trim().split(' ').join('_')
  },
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  path: {
    type: String,
    required: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  product_id: {
    type: mongoose.Types.ObjectId,
    default: null,
    unique: true,
    sparse: true
  }
});

IntegrationPathSchema.statics.findIntegrationPathById = function (id, callback) {
  const IntegrationPath = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  IntegrationPath.findById(mongoose.Types.ObjectId(id.toString()), (err, integration_path) => {
    if (err) return callback('database_error');
    if (!integration_path) return callback('document_not_found');

    return callback(null, integration_path);
  });
};

IntegrationPathSchema.statics.createIntegrationPath = function (data, callback) {
  const IntegrationPath = this;

  if (!data)
    return callback('bad_request');

  IntegrationPath.findIntegrationPathCountByCompanyId(data.company_id, (err, count) => {
    if (err) return callback(err);

    if (!data.type || !type_values.includes(data.type))
      return callback('bad_request');

    if (data.type != 'product' && count >= MAX_INTEGRATION_PATH_COUNT)
      return callback('bad_request');
    
    if (!data.name || typeof data.name != 'string' || !data.name.length || data.name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (!data.path || typeof data.path != 'string' || !data.path.length || data.path.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (data.type == 'product' && (!data.product_id || !validator.isMongoId(data.product_id.toString())))
      return callback('bad_request');

    const newIntegrationPath = new IntegrationPath({
      type: data.type,
      signature: data.company_id.toString() + data.name.toLocaleLowerCase().trim().split(' ').map(each => each.trim()).filter(each => each.length).join('_'),
      company_id: data.company_id,
      name: data.name.trim(),
      path: data.path.trim(),
      product_id: data.type == 'product' ? mongoose.Types.ObjectId(data.product_id.toString()) : null
    });

    newIntegrationPath.save((err, integration_path) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err)
        return callback('database_error');

      return callback(null, integration_path._id.toString());
    });
  });
};

IntegrationPathSchema.statics.findIntegrationPathSortedByCompanyId = function (company_id, callback) {
  const IntegrationPath = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');
  
  IntegrationPath
    .find({
      company_id: mongoose.Types.ObjectId(company_id.toString())
    })
    .sort({ name: 1 })
    .then(integration_paths => callback(null, integration_paths))
    .catch(err => callback('database_error'));
};

IntegrationPathSchema.statics.findIntegrationPathCountByCompanyId = function (company_id, callback) {
  const IntegrationPath = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');
  
  IntegrationPath
    .find({
      company_id: mongoose.Types.ObjectId(company_id.toString())
    })
    .countDocuments()
    .then(count => callback(null, count))
    .catch(err => callback('database_error'));
};

IntegrationPathSchema.statics.findIntegrationPathByIdAndDelete = function (id, callback) {
  const IntegrationPath = this;

  IntegrationPath.findIntegrationPathById(id, (err, integration_path) => {
    if (err) return callback(err);

    IntegrationPath.findByIdAndDelete(integration_path._id, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('IntegrationPath', IntegrationPathSchema);
