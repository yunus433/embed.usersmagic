const mongoose = require('mongoose');
const validator = require('validator');

const Company = require('../company/Company');
const IntegrationPath = require('../integration_path/IntegrationPath');

const getProduct = require('./functions/getProduct');

const Schema = mongoose.Schema;

const MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH = 1e2;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_NUMERIC_FIELD_LENGTH = 1e6;
const MAX_PRODUCT_LIMIT_BY_COMPANY = 10;

const ProductSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH
  },
  path: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  }
});

ProductSchema.statics.findProductById = function (id, callback) {
  const Product = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Product.findById(mongoose.Types.ObjectId(id.toString()), (err, product) => {
    if (err) return callback('database_error');
    if (!product) return callback('document_not_found');

    return callback(null, product);
  });
};

ProductSchema.statics.findProductByIdAndFormat = function (id, callback) {
  const Product = this;

  Product.findProductById(id, (err, product) => {
    if (err) return callback(err);

    getProduct(product, (err, product) => {
      if (err) return callback(err);

      return callback(null, product);
    });
  });
};

ProductSchema.statics.findProductsByCompanyId = function (company_id, callback) {
  const Product = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');

  Product.find({
    company_id: mongoose.Types.ObjectId(company_id.toString())
  }, (err, products) => {
    if (err) return callback('database_error');

    return callback(null, products);
  });
};

ProductSchema.statics.createProduct = function (data, callback) {
  const Product = this;

  if (!data || !data.company_id || !data.name || !data.path)
    return callback('bad_request');

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    Product.findProductsByCompanyId(company._id, (err, products) => {
      if (err) return callback(err);
      if (products.length >= MAX_PRODUCT_LIMIT_BY_COMPANY) return callback('too_many_documents');

      if (typeof data.name != 'string' || !data.name.trim().length || data.name.length > MAX_DATABASE_SHORT_TEXT_FIELD_LENGTH)
        return callback('bad_request');

      if (typeof data.path != 'string' || !data.path.length || data.path.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
        return callback('bad_request');

      const newProductData = {
        company_id: company._id,
        name: data.name.trim(),
        path: data.path.trim()
      };

      const newProduct = new Product(newProductData);

      newProduct.save((err, product) => {
        if (err) return callback('database_error');

        IntegrationPath.createIntegrationPath({
          type: 'product',
          name: `${product.name} - Product Page`,
          path: product.path,
          product_id: product._id,
          company_id: company._id
        }, (err, integration_path_id) => {
          if (err) return callback(err);

          return callback(null, product._id.toString());
        });
      });
    });
  });
};

module.exports = mongoose.model('Product', ProductSchema);
