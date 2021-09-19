const mongoose = require('mongoose');
const validator = require('validator');

const Company = require('../company/Company');

const getProduct = require('./functions/getProduct');

const Schema = mongoose.Schema;

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_NUMERIC_FIELD_LENGTH = 1e6;

const ProductSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  link: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  price: {
    type: Number,
    required: true,
    max: MAX_DATABASE_NUMERIC_FIELD_LENGTH
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

ProductSchema.statics.createProduct = function (data, callback) {
  const Product = this;

  if (!data || !data.company_id || !data.name || !data.link || !data.price)
    return callback('bad_request');

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    if (typeof data.name != 'string' || !data.name.trim().length || data.name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (typeof data.link != 'string' || !validator.isURL(data.link))
      return callback('bad_request');
    
    if (isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0 || parseFloat(data.price) > MAX_DATABASE_NUMERIC_FIELD_LENGTH)
      return callback('bad_request');

    const newProductData = {
      company_id: company._id,
      name: data.name.trim(),
      link: data.link.trim(),
      price: parseFloat(data.price)
    };

    const newProduct = new Product(newProductData);

    newProduct.save((err, product) => {
      if (err) return callback('database_error');

      return callback(null, product._id.toString());
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
}

module.exports = mongoose.model('Product', ProductSchema);
