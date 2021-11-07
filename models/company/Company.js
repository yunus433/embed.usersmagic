const dns = require('dns');
const mongoose = require('mongoose');
const validator = require('validator');

const getCompany = require('./functions/getCompany');
const validateDomain = require('./functions/validateDomain');

const preferred_language_values = ['en', 'tr'];

const DOMAIN_VERIFICATION_KEY = 'usersmagic-domain-verification';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const PREFERRED_LANGUAGE_LENGTH = 2;

const Schema = mongoose.Schema;

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  country: {
    type: String,
    length: 2,
    default: null
  },
  is_on_waitlist: {
    type: Boolean,
    default: true
  },
  domain: {
    type: String,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    default: null
  },
  waiting_domain: {
    type: String,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    default: null
  },
  preferred_language: {
    type: String,
    default: 'en',
    length: PREFERRED_LANGUAGE_LENGTH
  }
});

CompanySchema.statics.createCompany = function (data, callback) {
  const Company = this;

  if (!data || !data.name || typeof data.name != 'string' || !data.name.length || data.name.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const newCompanyData = {
    name: data.name.trim()
  };

  const newCompany = new Company(newCompanyData);

  newCompany.save((err, company) => {
    if (err) return callback('database_error');

    return callback(null, company._id.toString());
  });
};

CompanySchema.statics.findCompanyById = function (id, callback) {
  const Company = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Company.findById(mongoose.Types.ObjectId(id.toString()), (err, company) => {
    if (err) return callback('database_error');
    if (!company) return callback('document_not_found');

    return callback(null, company);
  });
};

CompanySchema.statics.findCompanyByIdAndRemoveFromWaitlist = function (id, data, callback) {
  const Company = this;

  if (!data || !data.preferred_language || !preferred_language_values.includes(data.preferred_language))
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    Company.findByIdAndUpdate(company._id, {$set: {
      is_on_waitlist: false,
      preferred_language: data.preferred_language
    }}, err => {
      if (err) return callback('bad_request');

      return callback(null);
    });
  });
};

CompanySchema.statics.findCompanyByDomain = function (domain, callback) {
  const Company = this;

  if (!domain || typeof domain != 'string')
    return callback('bad_request');

  Company.findOne({
    domain: domain.trim()
  }, (err, company) => {
    if (err) return callback('database_error');
    if (!company) return callback('document_not_found');

    return callback(null, company);
  });
};

CompanySchema.statics.findCompanyByIdAndFormat = function (id, callback) {
  const Company = this;

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    getCompany(company, (err, company) => {
      if (err) return callback(err);

      return callback(null, company);
    });
  });
};

CompanySchema.statics.findCompanyByIdAndVerifyWaitingDomain = function (id, callback) {
  const Company = this;

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);
    if (!company.waiting_domain) return callback('bad_request');

    dns.resolveTxt(company.waiting_domain, (err, records) => {
      if (err) return callback('unknown_error');

      if (!records.length || !records.find(each => each[0] == `${DOMAIN_VERIFICATION_KEY}=${company._id.toString()}`))
        return callback(null, false);

      Company.findByIdAndUpdate(company._id, {$set: {
        domain: company.waiting_domain,
        waiting_domain: null
      }}, err => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        return callback(null, true);
      });
    });
  });
};

CompanySchema.statics.findCompanyByIdAndUpdateWaitingDomain = function (id, data, callback) {
  const Company = this;

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    if (company.domain || company.waiting_domain)
      return callback('bad_request');

    validateDomain(data.domain, (err, domain) => {
      if (err) return callback(err);

      Company.findByIdAndUpdate(company._id, {$set: {
        waiting_domain: domain
      }}, err => {
        if (err) return callback('database_error');

        return callback(null, domain);
      });
    });
  });
};

CompanySchema.statics.findCompanyByIdAndDeleteDomainAndWaitingDomain = function (id, callback) {
  const Company = this;

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    if (!company.domain && !company.waiting_domain)
      return callback(null);

    Company.findByIdAndUpdate(company._id, {$set: {
      domain: null,
      waiting_domain: null
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

CompanySchema.statics.findCompanyByIdAndUpdate = function (id, data, callback) {
  const Company = this;

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    Company.findByIdAndUpdate(company._id, {$set: {
      name: data.name && typeof data.name == 'string' && data.name.length && data.name.length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name : company.name,
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

CompanySchema.statics.findCompanyByIdAndUpdatePreferredLanguage = function (id, data, callback) {
  const Company = this;

  if (!data || !data.preferred_language || !preferred_language_values.includes(data.preferred_language))
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    Company.findByIdAndUpdate(company._id, {$set: {
      preferred_language: data.preferred_language
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Company', CompanySchema);
