const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Company = require('../company/Company');
const Product = require('../product/Product');
const Template = require('../template/Template');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;

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
          if (template.type == 'product') {
            Product.findProductById(data.product_id, (err, product) => {
              if (err) return callback(err);
    
              const newQuestionData = {
                signature: template._id.toString() + company._id.toString() + product._id.toString(),
                template_id: template._id,
                company_id: company._id,
                product_id: product._id,
                order_number
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
              order_number
            };

            const newQuestion = new Question(newQuestionData);

            newQuestion.save((err, question) => {
              if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                return callback('duplicated_unique_field');
              if (err) return callback('database_error');

              return callback(null, question._id.toString());
            });
          }
        })
        .catch(err => callback('database_error'));
    });
  });
};

QuestionSchema.statics.findQuestionsByFiltersAndSorted = function (data, callback) {
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
    .sort({ order_number: 1 })
    .then(questions => callback(null, questions))
    .catch(err => callback('database_error'));
};

QuestionSchema.statics.findQuestionByIdAndDeactivate = function (id, data, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != data.company_id.toString())
      return callback('not_authenticated_request');

    Question.findByIdAndUpdate(question._id, {$set: {
      is_active: false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

QuestionSchema.statics.findQuestionByIdAndActivate = function (id, data, callback) {
  const Question = this;

  Question.findQuestionById(id, (err, question) => {
    if (err) return callback(err);
    if (question.company_id.toString() != data.company_id.toString())
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

QuestionSchema.statics.createQuestionsForCompany = function (company_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);
    if (company.is_on_waitlist) return callback('not_authenticated_request');

    Template.findTemplatesByFiltersAndSorted({
      type: ['demographics', 'brand']
    }, (err, templates) => {
      if (err) return callback(err);

      Template.findTemplatesByFiltersAndSorted({
        type: 'product'
      }, (err, product_templates) => {
        if (err) return callback(err);
  
        async.timesSeries(
          templates.length,
          (time, next) => {
            const template = templates[time];

            Question.findOne({
              signature: template._id.toString() + company._id.toString()
            }, (err, question) => {
              if (err) return next('database_error');

              if (question) return next(null);

              Question.createQuestion({
                template_id: template._id,
                company_id: company._id
              }, err => next(err));
            });
          },
          err => {
            if (err) return callback(err);

            Product.findProductsByCompanyId(company._id, (err, products) => {
              if (err) return callback(err);

              async.timesSeries(
                products.length,
                (time, next) => {
                  const product = products[time];

                  async.timesSeries(
                    product_templates.length,
                    (time, next) => {
                      const template = product_templates[time];

                      Question.findOne({
                        signature: template._id.toString() + company._id.toString() + product._id.toString()
                      }, (err, question) => {
                        if (err) return next('database_error');
          
                        if (question) return next(null);
          
                        Question.createQuestion({
                          template_id: template._id,
                          company_id: company._id,
                          product_id: product._id
                        }, err => next(err));
                      });
                    },
                    err => next(err)
                  );
                },
                err => {
                  if (err) return callback(err);

                  return callback(null);
                }
              );
            });
          }
        );
      });
    });
  });
};

QuestionSchema.statics.findQuestionsForCompany = function (company_id, callback) {
  const Question = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');

  const data = {
    demographics: [],
    brand: []
  };

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

            if (template.type == 'demographics' || template.type == 'brand') {
              data[template.type].push(template);
              return next(null);
            }

            Product.findProductById(question.product_id, (err, product) => {
              if (err) return next(err);

              if (!data[product._id.toString()])
                data[product._id.toString()] = [];

              data[product._id.toString()].push({
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

              return next(null);
            });
          });
        },
        err => {
          if (err) return callback(err);

          return callback(null, data);
        }
      );
    })
    .catch(err => callback('database_error'));
};

QuestionSchema.statics.findQuestionsAndProductByProductIdAndDelete = function (company_id, product_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Product.findProductById(product_id, (err, product) => {
      if (err) return callback(err);
      if (product.company_id != company._id) return callback('not_authenticated_request');
    })
  })

  Question.findQuestionsByFiltersAndSorted({
    company_id,
    product_id
  })
};

module.exports = mongoose.model('Question', QuestionSchema);
