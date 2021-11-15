const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Answer = require('../answer/Answer');
const Company = require('../company/Company');
const Person = require('../person/Person');
const Template = require('../template/Template');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_TARGET_GROUP_COUNT_PER_COMPANY = 1e2;
const MAX_FILTER_COUNT_PER_TARGET_GROUP = 100;

const Schema = mongoose.Schema;

const TargetGroupSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    unique: true,
    required: true
  },
  filters: {
    type: Array,
    default: [],
    maxlength: MAX_FILTER_COUNT_PER_TARGET_GROUP
  }
});

TargetGroupSchema.statics.findTargetGroupById = function (id, callback) {
  const TargetGroup = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  TargetGroup.findById(mongoose.Types.ObjectId(id.toString()), (err, target_group) => {
    if (err) return callback('database_error');
    if (!target_group) return callback('document_not_found');

    return callback(null, target_group);
  });
};

TargetGroupSchema.statics.createTargetGroup = function (data, callback) {
  const TargetGroup = this;

  if (!data)
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.filters || !Array.isArray(data.filters) || data.filters.length > MAX_FILTER_COUNT_PER_TARGET_GROUP)
    return callback('bad_request');

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    TargetGroup.findTargetGroupsCountByCompanyId(company._id, (err, count) => {
      if (err) return callback(err);
      if (count >= MAX_TARGET_GROUP_COUNT_PER_COMPANY)
        return callback('too_many_documents');

      async.timesSeries(
        data.filters.length,
        (time, next) => {
          const filter = filters[time];
          const newFilter = {};

          if (!filter.template_id || !filter.allowed_answers || !Array.isArray(filter.allowed_answers))
            return next('bad_request');

          Template.findTemplateByIdAndFormat(filter.template_id, (err, template) => {
            if (err) return next(err);

            newFilter.template_id = template._id.toString();
            newFilter.allowed_answers = filter.allowed_answers.map(each => each.trim()).filter(each => template.choices.includes(each));

            if (!newFilter.allowed_answers.length)
              return next('bad_request');

            return next(null, newFilter);
          });
        },
        (err, filters) =>{
          if (err) return callback(err);

          const newTargetGroupData = {
            company_id: company._id,
            name: data.name.trim(),
            filters
          };
      
          const newTargetGroup = new TargetGroup(newTargetGroupData);
      
          newTargetGroup.save((err, target_group) => {
            if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE) return callback('duplicated_unique_field');
            if (err) return callback('database_error');

            return callback(null, target_group._id.toString());     
          });
        }
      );
    });
  });
};

TargetGroupSchema.statics.findTargetGroupsByCompanyId = function (company_id, callback) {
  const TargetGroup = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    TargetGroup
      .find({
        company_id: company._id
      })
      .sort({ name: 1 })
      .then(target_groups => callback(null, target_groups))
      .catch(err => callback('database_error'));
  });
};

TargetGroupSchema.statics.findTargetGroupsCountByCompanyId = function (company_id, callback) {
  const TargetGroup = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    TargetGroup
      .find({
        company_id: company._id
      })
      .countDocuments()
      .then(count => callback(null, count))
      .catch(err => callback('database_error'));
  });
};

TargetGroupSchema.statics.findTargetGroupByIdAndCheckIfPersonCanSee = function (data, callback) {
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(data.target_group_id, (err, target_group) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);
      if (target_group.company_id != company._id)
        return callback('not_authenticated_request');

      Person.findPersonById(data.person_id, (err, person) => {
        if (err) return callback(err);

        async.timesSeries(
          target_group.filters.length,
          (time, next) => {
            const filter = filters[time];
  
            Answer.findOneAnswer({
              template_id: filter.template_id,
              answer_given_to_template: filter.allowed_answers,
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

TargetGroupSchema.statics.deleteTargetGroupById = function (id, callback) {
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(id, (err, target_group) => {
    if (err) return callback(err);

    TargetGroup.findByIdAndDelete(target_group._id, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('TargetGroup', TargetGroupSchema);
