const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Company = require('../company/Company');
const IntegrationPath = require('../integration_path/IntegrationPath');
const Product = require('../product/Product');
const Template = require('../template/Template');

const getQuestion = require('./functions/getQuestion');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_QUESTION_NUMBER_PER_COMPANY = 20;
const QUESTION_CREATED_AT_LENGTH = 10;

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  signature: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  template_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  product_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  order_number: {
    type: Number,
    required: true,
    index: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  integration_path_id_list: {
    type: Array,
    default: []
  },
  created_at: {
    type: String,
    required: true,
    length: QUESTION_CREATED_AT_LENGTH
  }
});

QuestionSchema.statics.findQuestionById = function (id, callback) {
  const Question = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Question.findById(mongoose.Types.ObjectId(id.toString()), (err, question) => {
    if (err) return callback('database_error');
    if (!question) return callback('document_not_found');

    return callback(null, question);
  });
};

QuestionSchema.statics.findQuestionByIdAndFormat = function (id, callback) {
  const Question = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Question.findById(mongoose.Types.ObjectId(id.toString()), (err, question) => {
    if (err) return callback('database_error');
    if (!question) return callback('document_not_found');

    getQuestion(question, (err, question) => {
      if (err) return callback(err);

      return callback(null, question);
    });
  });
};

QuestionSchema.statics.createQuestion = function (data, callback) {
  const Question = this;

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);
    if (company.is_on_waitlist) return callback('not_authenticated_request');

    Template.findTemplateById(data.template_id, (err, template) => {
      if (err) return callback(err);

      Question
        .find({
          company_id: company._id
        })
        .countDocuments()
        .then(order_number => {
          if (order_number >= MAX_QUESTION_NUMBER_PER_COMPANY)
            return callback('too_many_documents');

          if (!data.integration_path_id_list || !Array.isArray(data.integration_path_id_list))
            data.integration_path_id_list = [];

          if (!data.created_at || typeof data.created_at != 'string' || data.created_at.length != QUESTION_CREATED_AT_LENGTH)
            return callback('bad_request');

          async.timesSeries(
            data.integration_path_id_list.length,
            (time, next) => IntegrationPath.findIntegrationPathById(data.integration_path_id_list[time], (err, integration_path) => {
              if (err) return next(err);
              if (integration_path.company_id.toString() != company._id.toString())
                return next('not_authenticated_request');

              return next(null, integration_path._id.toString());
            }),
            (err, integration_path_id_list) => {
              if (err) return callback(err);

              if (template.type == 'product') {
                Product.findProductById(data.product_id, (err, product) => {
                  if (err) return callback(err);
        
                  const newQuestionData = {
                    signature: template._id.toString() + company._id.toString() + product._id.toString(),
                    template_id: template._id,
                    company_id: company._id,
                    product_id: product._id,
                    order_number,
                    created_at: data.created_at,
                    integration_path_id_list,
                    created_at: moment
                  };
    
                  const newQuestion = new Question(newQuestionData);
    
                  newQuestion.save((err, question) => {
                    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                      return callback('duplicated_unique_field');
                    if (err) return callback('database_error');
    
                    return callback(null, question._id.toString());
                  });
                });
              } else {
                const newQuestionData = {
                  signature: template._id.toString() + company._id.toString(),
                  template_id: template._id,
                  company_id: company._id,
                  order_number,
                  created_at: data.created_at,
                  integration_path_id_list
                };
    
                const newQuestion = new Question(newQuestionData);
    
                newQuestion.save((err, question) => {
                  if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                    return callback('duplicated_unique_field');
                  if (err) return callback('database_error');
    
                  return callback(null, question._id.toString());
                });
              }
            }
          );
        })
        .catch(err => callback('database_error'));
    });
  });
};

QuestionSchema.statics.createQuestionsForDefaultTemplates = function (company_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Template.findTemplatesByFiltersAndSorted({
      language: company.preferred_language,
      is_default_template: true
    }, (err, templates) => {
      if (err) return callback(err);

      async.timesSeries(
        templates.length,
        (time, next) => {
          Question.createQuestion({
            company_id: company._id,
            template_id: templates[time]._id
          }, err => next(err));
        },
        err => {
          if (err) return callback(err);

          return callback(null);
        }
      );
    });
  });
};

QuestionSchema.statics.findQuestionsByFiltersAndSorted = function (data, callback) {
  const Question = this;

  const filters = {};

  if (data.company_id && validator.isMongoId(data.company_id.toString()))
    filters.company_id = mongoose.Types.ObjectId(data.company_id.toString());

  if (data.product_id && validator.isMongoId(data.product_id.toString()))
    filters.product_id = mongoose.Types.ObjectId(data.product_id.toString());

  if (data.min_order_number && Number.isInteger(data.min_order_number))
    filters.order_number = { $gt: data.min_order_number };

  if ('is_active' in data)
    filters.is_active = data.is_active ? true : false;

  Question
    .find(filters)
    .sort({ order_number: -1 })
    .then(questions => callback(null, questions))
    .catch(err => callback('database_error'));
};

QuestionSchema.statics.findQuestionByIdAndCompanyIdAndDeactivate = function (id, company_id, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Question.findByIdAndUpdate(question._id, {$set: {
      is_active: false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

QuestionSchema.statics.findQuestionByIdAndCompanyIdAndActivate = function (id, company_id, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Question.findByIdAndUpdate(question._id, {$set: {
      is_active: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

QuestionSchema.statics.findQuestionByIdAndIncreaseOrder = function (id, data, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != data.company_id.toString())
      return callback('not_authenticated_request');

    if (question.order_number <= 0)
      return callback(null);

    Question.findOne({
      company_id: question.company_id,
      order_number: question.order_number - 1
    }, (err, prev_question) => {
      if (err) return callback('database_error');
      if (!prev_question) return callback(null);

      Question.findByIdAndUpdate(question._id, {$inc: {
        order_number: -1
      }}, err => {
        if (err) return callback('database_error');

        Question.findByIdAndUpdate(prev_question._id, {$inc: {
          order_number: 1
        }}, err => {
          if (err) return callback('database_error');
  
          return callback(null);
        });
      });
    });
  });
};

QuestionSchema.statics.findQuestionByIdAndDecreaseOrder = function (id, data, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != data.company_id.toString())
      return callback('not_authenticated_request');

    Question.findOne({
      company_id: question.company_id,
      order_number: question.order_number + 1
    }, (err, next_question) => {
      if (err) return callback('database_error');
      if (!next_question) return callback(null);

      Question.findByIdAndUpdate(question._id, {$inc: {
        order_number: 1
      }}, err => {
        if (err) return callback('database_error');

        Question.findByIdAndUpdate(next_question._id, {$inc: {
          order_number: -1
        }}, err => {
          if (err) return callback('database_error');
  
          return callback(null);
        });
      });
    });
  });
};

QuestionSchema.statics.findQuestionsForCompany = function (company_id, callback) {
  const Question = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');

  Question
    .find({
      company_id: mongoose.Types.ObjectId(company_id.toString())
    })
    .sort({ order_number: 1 })
    .then(questions => {
      async.timesSeries(
        questions.length,
        (time, next) => {
          const question = questions[time];

          Template.findTemplateById(question.template_id, (err, template) => {
            if (err) return next(err);

            if (template.type == 'demographics' || template.type == 'brand')
              return next(null, {
                _id: question._id.toString(),
                template_id: question.template_id,
                timeout_duration_in_week: template.timeout_duration_in_week,
                order_number: template.order_number,
                name: template.name,
                text: template.text,
                type: template.type,
                subtype: template.subtype,
                choices: template.choices,
                min_value: template.min_value,
                max_value: template.max_value,
                labels: template.labels
              });

            Product.findProductById(question.product_id, (err, product) => {
              if (err) return next(err);

              if (!data[product._id.toString()])
                data[product._id.toString()] = [];

              return next(null, {
                _id: question._id.toString(),
                template_id: question.template_id,
                timeout_duration_in_week: template.timeout_duration_in_week,
                order_number: template.order_number,
                name: template.name.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
                text: template.text.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
                product_link: product.link,
                type: template.type,
                subtype: template.subtype,
                choices: template.choices,
                min_value: template.min_value,
                max_value: template.max_value,
                labels: template.labels
              });
            });
          });
        },
        (err, questions) => {
          if (err) return callback(err);

          return callback(null, questions);
        }
      );
    })
    .catch(err => callback('database_error'));
};

QuestionSchema.statics.findQuestionsForCompanyAndDelete = function (company_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Questions.find({
      company_id: mongoose.Types.ObjectId(company._id)
    }, (err, questions) => {
      if (err) return callback('database_error');

      async.timesSeries(
        questions.length,
        (time, next) => Question.findByIdAndDelete(mongoose.Types.ObjectId(questions[time]._id.toString()), err => next(err)),
        err => {
          if (err) return callback('database_error');

          return callback(null);
        }
      );
    });
  });
};

QuestionSchema.statics.findQuestionByIdAndCompanyIdAndDelete = function (id, company_id, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != company_id.toString())
      return callback('not_authenticated_request');

    Question.findByIdAndDelete(question._id, err => {
      if (err) return callback('database_error');

      return callback(null)
    });
  });
};

QuestionSchema.statics.findUnusedTemplatesForCompany = function (company_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Question.findQuestionsByFiltersAndSorted({
      company_id: company._id
    }, (err, questions) => {
      if (err) return callback(err);
      
      const template_id_list = questions.map(each => each.template_id.toString());

      Template.findTemplatesByFiltersAndSorted({
        language: company.preferred_language,
        nin_id_list: template_id_list
      }, (err, templates) => {
        if (err) return callback(err);

        return callback(null, templates);
      });
    });
  });
};

QuestionSchema.statics.findUnusedProductTemplatesForCompanyByProductId = function (data, callback) {
  const Question = this;

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    Product.findProductById(data.product_id, (err, product) => {
      if (err) return callback(err);

      if (product.company_id.toString() != company._id.toString())
        return callback('not_authenticated_request');

      Question.findQuestionsByFiltersAndSorted({
        company_id: company._id,
        product_id: product._id
      }, (err, questions) => {
        if (err) return callback(err);
        
        const template_id_list = questions.map(each => each.template_id.toString());
    
        Template.findTemplatesByFiltersAndSorted({
          language: company.preferred_language,
          type: 'product',
          nin_id_list: template_id_list
        }, (err, templates) => {
          if (err) return callback(err);
    
          return callback(null, templates);
        });
      });
    });
  });
};

QuestionSchema.statics.findQuestionsByIntegrationPathId = function (integration_path_id, callback) {
  const Question = this;

  if (!integration_path_id || !validator.isMongoId(integration_path_id.toString()))
    return callback('bad_request');

  Question.find({
    integration_path_id_list: integration_path_id.toString()
  }, (err, questions) => {
    if (err) return callback('database_error');

    return callback(null, questions);
  });
};

module.exports = mongoose.model('Question', QuestionSchema);
