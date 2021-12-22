const dns = require('dns');
const mongoose = require('mongoose');
const validator = require('validator');

const getCompany = require('./functions/getCompany');
const validateDomain = require('./functions/validateDomain');

const preferred_language_values = ['en', 'tr'];

const DOMAIN_VERIFICATION_KEY = 'usersmagic-domain-verification';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e2;
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
  integration_routes: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
    // {
    //   _id: mongoose.Types.ObjectId(),
    //   name: String,
    //   route: String,
    //   is_active: Boolean
    // }
  },
  preferred_language: {
    type: String,
    default: 'en',
    length: PREFERRED_LANGUAGE_LENGTH
  },
  preferred_color: {
    type: String,
    default: '#2EC5CE',
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    minlength: 1
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

  if (!data)
    return callback('bad_request');

  if (!data.preferred_language || !preferred_language_values.includes(data.preferred_language))
    return callback('bad_request');

  if (!data.preferred_color || typeof data.preferred_color != 'string' || !data.preferred_color.trim().length)
    return callback('bad_request');  

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    Company.findByIdAndUpdate(company._id, {$set: {
      is_on_waitlist: false,
      preferred_language: data.preferred_language,
      preferred_color: data.preferred_color.trim()
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

CompanySchema.statics.findCompanyByIdAndCreateIntegrationRoute = function (id, data, callback) {
  const Company = this;

  if (!data)
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.route || typeof data.route != 'string' || !data.route.trim().length || data.route.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    if (company.integration_routes && company.integration_routes.length >= MAX_DATABASE_ARRAY_FIELD_LENGTH)
      return callback('too_many_documents');

    const newIntegrationRoute = {
      _id: mongoose.Types.ObjectId(),
      name: data.name.trim(),
      route: data.route.trim(),
      is_active: true
    };

    const integrationRouteUpdateArray = [];
    integrationRouteUpdateArray.push(newIntegrationRoute);

    Company.findByIdAndUpdate(company._id, {$push: {
      integration_routes: {
        $each: integrationRouteUpdateArray,
        $sort: {
          name: 1
        }
      }
    }}, err => {
      if (err) return callback('database_error');

      return callback(null, newIntegrationRoute._id.toString());
    });
  });
};

CompanySchema.statics.findCompanyByIdAndDeleteIntegrationRouteById = function (id, data, callback) {
  const Company = this;

  if (!data || !data.integration_route_id || !validator.isMongoId(data.integration_route_id.toString()))
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    Company.findByIdAndUpdate(company._id, {$pull: {
      integration_routes: {
        _id: mongoose.Types.ObjectId(data.integration_route_id.toString())
      }
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

CompanySchema.statics.findCompanyByIdAndActivateIntegrationRouteById = function (id, data, callback) {
  const Company = this;

  if (!data || !data.integration_route_id || !validator.isMongoId(data.integration_route_id.toString()))
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    const integrationRoute = company.integration_routes.find(each => each._id == data.integration_route_id.toString());

    if (!integrationRoute)
      return callback('document_not_found');

    if (integrationRoute.is_active)
      return callback(null);

    Company.findByIdAndUpdate(company._id, {$set: {
      [`integration_routes.${integrationRoute._id.toString()}.is_active`]: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

CompanySchema.statics.findCompanyByIdAndDeactivateIntegrationRouteById = function (id, data, callback) {
  const Company = this;

  if (!data || !data.integration_route_id || !validator.isMongoId(data.integration_route_id.toString()))
    return callback('bad_request');

  Company.findCompanyById(id, (err, company) => {
    if (err) return callback(err);

    const integrationRoute = company.integration_routes.find(each => each._id == data.integration_route_id.toString());

    if (!integrationRoute)
      return callback('document_not_found');

    if (!integrationRoute.is_active)
      return callback(null);

    Company.findByIdAndUpdate(company._id, {$set: {
      [`integration_routes.${integrationRoute._id.toString()}.is_active`]: false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Company', CompanySchema);
