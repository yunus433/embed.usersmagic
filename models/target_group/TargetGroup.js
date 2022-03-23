const async = require('async');
const hash = require('hash.js');
const mongoose = require('mongoose');
const validator = require('validator');

const Answer = require('../answer/Answer');
const Company = require('../company/Company');
const Person = require('../person/Person');
const Question = require('../question/Question');
const Template = require('../template/Template');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const FACEBOOK_MAX_EMAIL_COUNT_PER_FILE = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_TARGET_GROUP_COUNT_PER_COMPANY = 1e2;
const MAX_FILTER_COUNT_PER_TARGET_GROUP = 1e2;

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
    required: true
  },
  filters: {
    type: Array,
    default: [],
    maxlength: MAX_FILTER_COUNT_PER_TARGET_GROUP
    /*
      question_id,
      allowed_answers: []
    */
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

TargetGroupSchema.statics.findTargetGroupByIdAndFormat = function (id, callback) {
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(id, (err, target_group) => {
    if (err) return callback(err);

    TargetGroup.findTargetGroupByIdAndEstimatePeopleCount({
      company_id: target_group.company_id,
      target_group_id: target_group._id
    }, (err, count) => {
      if (err) return callback(err);

      async.timesSeries(
        target_group.filters.length,
        (time, next) => Question.findQuestionByIdAndFormat(target_group.filters[time].question_id, (err, question) => {
          if (err) return next(err);
  
          return next(null, {
            name: question.name,
            allowed_answers: (question.subtype == 'number' ? `[${target_group.filters[time].allowed_answers[0]} - ${target_group.filters[time].allowed_answers[target_group.filters[time].allowed_answers.length-1]}]` : target_group.filters[time].allowed_answers)
          });
        }),
        (err, filters) => {
          if (err) return callback(err);
  
          return callback(null, {
            _id: target_group._id,
            company_id: target_group.company_id,
            name: target_group.name,
            filters,
            estimated_people_count: count
          });
        }
      );
    });
  })
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
          const filter = data.filters[time];
          const newFilter = {};

          if (!filter.question_id || !filter.allowed_answers || !Array.isArray(filter.allowed_answers))
            return next('bad_request');

          Question.findQuestionById(filter.question_id, (err, question) => {
            if (err) return next(err);

            Template.findTemplateByIdAndFormat(question.template_id, (err, template) => {
              if (err) return next(err);
  
              newFilter.question_id = question._id.toString();
              newFilter.allowed_answers = filter.allowed_answers.map(each => each.toString().trim()).filter(each => template.choices.includes(each));
  
              if (!newFilter.allowed_answers.length)
                return next('bad_request');
  
              return next(null, newFilter);
            });
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

TargetGroupSchema.statics.findTargetGroupsByCompanyIdAndFormat = function (company_id, callback) {
  const TargetGroup = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    TargetGroup
      .find({
        company_id: company._id
      })
      .sort({ name: 1 })
      .then(target_groups => {
        async.timesSeries(
          target_groups.length,
          (time, next) => {
            const target_group = target_groups[time];

            TargetGroup.findTargetGroupByIdAndEstimatePeopleCount({
              company_id: company._id,
              target_group_id: target_group._id
            }, (err, count) => {
              if (err) return next(err);

              async.timesSeries(
                target_group.filters.length,
                (time, next) => Question.findQuestionByIdAndFormat(target_group.filters[time].question_id, (err, question) => {
                  if (err) return next(err);

                  return next(null, {
                    name: question.name,
                    allowed_answers: (question.subtype == 'number' ? `[${target_group.filters[time].allowed_answers[0]} - ${target_group.filters[time].allowed_answers[target_group.filters[time].allowed_answers.length-1]}]` : target_group.filters[time].allowed_answers)
                  });
                }),
                (err, filters) => {
                  if (err) return next(err);

                  return next(null, {
                    _id: target_group._id,
                    name: target_group.name,
                    filters,
                    estimated_people_count: count
                  });
                }
              );
            });
          },
          (err, target_groups) => {
            if (err) return callback(err);

            return callback(null, target_groups);
          }
        )
      })
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
      if (target_group.company_id.toString() != company._id.toString())
        return callback('not_authenticated_request');

      Person.findPersonById(data.person_id, (err, person) => {
        if (err) return callback(err);

        async.timesSeries(
          target_group.filters.length,
          (time, next) => {
            const filter = target_group.filters[time];
  
            Answer.findOneAnswer({
              question_id: filter.question_id,
              answer_given_to_question: filter.allowed_answers,
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

TargetGroupSchema.statics.findTargetGroupByIdAndGetTheFilterWithSmallestUserCount = function (data, callback) {
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(data.target_group_id, (err, target_group) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);
      if (target_group.company_id.toString() != company._id.toString())
        return callback('not_authenticated_request');

      if (!target_group.filters || !target_group.filters.length)
        return callback('bad_request');
  
      let minUserCount = null;
      let minUserFilter = null;
  
      async.timesSeries(
        target_group.filters.length,
        (time, next) => {
          const filter = target_group.filters[time];
  
          Answer.findAnswersAndCountUsersByFilters({
            question_id: filter.question_id,
            answer_given_to_question: filter.allowed_answers
          }, (err, count) => {
            if (err) return next(err);
            
            if (!minUserCount || count < minUserCount) {
              minUserCount = count;
              minUserFilter = filter;
            }
  
            return next(null);
          });
        },
        err => {
          if (err) return callback(err);
  
          return callback(null, minUserFilter);
        }
      );
    });
  });
};

TargetGroupSchema.statics.findTargetGroupByIdAndEstimatePeopleCount = function (data, callback) { // This is a statistical function, approximately 5000 documents are looked through for arrays with more than 5000 elements
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(data.target_group_id, (err, target_group) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);
      if (target_group.company_id.toString() != company._id.toString())
        return callback('not_authenticated_request');

      TargetGroup.findTargetGroupByIdAndGetTheFilterWithSmallestUserCount(data, (err, min_filter) => {
        if (err) return callback(err);
  
        Answer.findAnswersAndCountUsersByFilters({
          question_id: min_filter.question_id,
          answer_given_to_question: min_filter.allowed_answers
        }, (err, user_count) => {
          if (err) return callback(err);
  
          const probability = Math.min(1.0, 1000 / user_count);
  
          Answer.findAnswers({
            question_id: min_filter.question_id,
            answer_given_to_question: min_filter.allowed_answers
          }, (err, answers) => {
            if (err) return callback(err);
  
            let personCount = 0;
  
            async.timesSeries( // For all answers
              answers.length,
              (time, next) => {
                Answer.findAnswerById(answers[time]._id, (err, answer) => {
                  if (err) return next(err);
  
                  async.timesSeries( // For all people in the answer
                    answer.person_id_list.length,
                    (time, next) => {
                      const rand = Math.random();
  
                      if (rand > probability) // Look only with some probability
                        return next(null);

                      TargetGroup.findTargetGroupByIdAndCheckIfPersonCanSee({
                        target_group_id: target_group._id,
                        company_id: data.company_id,
                        person_id: answer.person_id_list[time]
                      }, (err, res) => {
                        if (err) return next(err);

                        if (res)
                          personCount += 1;

                        return next(null);
                      });
                    },
                    err => {
                      if (err) return next(err);
  
                      return next(null);
                    }
                  );
                });
              },
              err => {
                if (err) return callback(err);
  
                return callback(null, Math.round(personCount / probability));
              }
            );
          });
        });
      });
    });
  });
};

TargetGroupSchema.statics.findTargetGroupByIdAndGetHashedPersonEmailListForFacebook = function (data, callback) { // Each item in array is a 10k length hashed JASON stringify array
  const TargetGroup = this;

  TargetGroup.findTargetGroupById(data.target_group_id, (err, target_group) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);
      if (target_group.company_id.toString() != company._id.toString())
        return callback('not_authenticated_request');

      TargetGroup.findTargetGroupByIdAndGetTheFilterWithSmallestUserCount(data, (err, min_filter) => {
        if (err) return callback(err);

        Answer.findAnswers({
          question_id: min_filter.question_id,
          answer_given_to_question: min_filter.allowed_answers
        }, (err, answers) => {
          if (err) return callback(err);

          const stringifiedHashedPersonEmailListArray = [];
          let eachHashedPersonEmailList = [];

          async.timesSeries( // For all answers
            answers.length,
            (time, next) => {
              Answer.findAnswerById(answers[time]._id, (err, answer) => {
                if (err) return next(err);

                async.timesSeries( // For all people in the answer
                  answer.person_id_list.length,
                  (time, next) => {
                    TargetGroup.findTargetGroupByIdAndCheckIfPersonCanSee({
                      target_group_id: target_group._id,
                      company_id: data.company_id,
                      person_id: answer.person_id_list[time]
                    }, (err, res) => {
                      if (err) return next(err);

                      if (res) {
                        Person.findPersonById(answer.person_id_list[time], (err, person) => {
                          if (err) return next(err);

                          eachHashedPersonEmailList.push({
                            email: hash.sha256().update(person.email).digest('hex')
                          });

                          if (eachHashedPersonEmailList.length == FACEBOOK_MAX_EMAIL_COUNT_PER_FILE) {
                            stringifiedHashedPersonEmailListArray.push(eachHashedPersonEmailList);
                            eachHashedPersonEmailList = [];
                          }

                          return next(null);
                        });
                      } else {
                        return next(null);
                      }
                    });
                  },
                  err => {
                    if (err) return next(err);

                    return next(null);
                  }
                );
              });
            },
            err => {
              if (err) return callback(err);

              if (eachHashedPersonEmailList.length) {
                stringifiedHashedPersonEmailListArray.push(eachHashedPersonEmailList);
                eachHashedPersonEmailList = [];
              }

              return callback(null, stringifiedHashedPersonEmailListArray);
            }
          );
        });
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
