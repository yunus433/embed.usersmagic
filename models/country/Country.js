const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  alpha_2_code: {
    type: String,
    required: true,
    unique: true,
    length: 2
  },
  cities: {
    type: Array,
    default: []
  }
});

CountrySchema.statics.findCountryByAlpha2Code = function (alpha_2_code, callback) {
  const Country = this;
  
  if (!alpha_2_code || typeof alpha_2_code != 'string')
    return callback('bad_request');

  Country.findOne({
    alpha_2_code: alpha_2_code.trim().toLowerCase()
  }, (err, country) => {
    if (err) return callbacl('database_error');
    if (!country) return callback('document_not_found');

    return callback(null, country);
  });
};

module.exports = mongoose.model('Country', CountrySchema);
