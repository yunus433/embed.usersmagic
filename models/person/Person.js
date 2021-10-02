const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getWeek = require('../../middleware/getWeek');

const Answer = require('../answer/Answer');
const Company = require('../company/Company');
const Product = require('../product/Product');
const Template = require('../template/Template');
const Question = require('../question/Question');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;

const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
});

PersonSchema.statics.findPersonById = function (id, callback) {
  const Person = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Person.findById(mongoose.Types.ObjectId(id.toString()), (err, person) => {
    if (err) return callback('database_error');
    if (!person) return callback('document_not_found');

    return callback(null, person);
  });
};

PersonSchema.statics.createPerson = function (data, callback) {
  const Person = this;

  if (!data || !data.email || !validator.isEmail(data.email.toString()))
    return callback('bad_request');

  const newPersonData = {
    email: data.email.toString().trim()
  };

  const newPerson = new Person(newPersonData);

  newPerson.save((err, person) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err) return callback('database_error');

    return callback(null, person._id.toString());
  });
};

PersonSchema.statics.findOrCreatePersonByEmail = function (email, callback) {
  const Person = this;

  if (!email || typeof email != 'string')
    return callback('bad_request');

  Person.findOne({
    email: email.trim()
  }, (err, person) => {
    if (err) return callback('database_error');
    if (person) return callback(null, person);

    Person.createPerson({
      email: email.trim()
    }, (err, id) => {
      if (err) return callback(err);

      Person.findPersonById(id, (err, person) => {
        if (err) return callback(err);

        return callback(null, person);
      });
    });
  });
};

PersonSchema.statics.createAnswerGroup = function (data, callback) {
  const Person = this;

  if (!data.answer_given_to_question || typeof data.answer_given_to_question != 'string' || !data.answer_given_to_question.trim().length || data.answer_given_to_question.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  data.answer_given_to_question = data.answer_given_to_question.trim();
    
  Question.findQuestionById(data.question_id, (err, question) => {
    if (err) return callback(err);
    if (!data.company_id || question.company_id.toString() != data.company_id.toString())
      return callback('not_authenticated_request');

    Template.findTemplateById(question.template_id, (err, template) => {
      if (err) return callback(err);

      if (template.subtype == 'yes_no' && !['yes', 'no'].includes(data.answer_given_to_question))
        return callback('bad_request');

      if ((template.subtype == 'single' || template.subtype == 'multiple' || template.subtype == 'list') && !template.choices.includes(data.answer_given_to_question))
        return callback('bad_request');

      if ((template.subtype == 'scale' || template.subtype == 'number') && (isNaN(parseInt(data.answer_given_to_question)) || template.min_value > parseInt(data.answer_given_to_question) || template.max_value < parseInt(data.answer_given_to_question)))
        return callback('bad_request');

      getWeek(0, (err, curr_week) => {
        if (err) return callback(err);
    
        getWeek(template.timeout_duration_in_week, (err, exp_week) => {
          if (err) return callback(err);
      
          const newAnswerData = {
            question_id: question._id,
            answer_given_to_question: data.answer_given_to_question,
            week_answer_is_given_in_unix_time: curr_week,
            week_answer_will_be_outdated_in_unix_time: exp_week
          };

          return Answer.createAnswerWithoutProcessing(newAnswerData, (err, id) => callback(err, id));
        });
      });
    });
  });
};

PersonSchema.statics.pushPersonToAnswerGroup = function (data, callback) {
  const Person = this;

  if (!data.answer_given_to_question || typeof data.answer_given_to_question != 'string' || !data.answer_given_to_question.trim().length || data.answer_given_to_question.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.company_id)
    return callback('bad_request');

  data.answer_given_to_question = data.answer_given_to_question.trim();

  Person.findPersonById(data.person_id, (err, person) => {
    if (err) return callback(err);

    Question.findQuestionById(data.question_id, (err, question) => {
      if (err) return callback(err);
      if (question.company_id.toString() != data.company_id.toString())
        return callback('not_authenticated_request');

      Answer.checkAnswerExists({
        question_id: question._id,
        answer_given_to_question: data.answer_given_to_question,
        person_id: data.person_id
      }, res => {
        if (res) return callback(null);

        getWeek(0, (err, curr_week) => {
          if (err) return callback(err);

          Answer.checkAnswerExists({
            question_id: question._id,
            answer_given_to_question: data.answer_given_to_question,
            week_answer_is_given_in_unix_time: curr_week,
            person_id_list_not_full: true
          }, res => {
            if (res) {
              Answer.findOneAnswer({
                question_id: question._id,
                answer_given_to_question: data.answer_given_to_question,
                week_answer_is_given_in_unix_time: curr_week,
                person_id_list_not_full: true
              }, (err, answer) => {
                if (err) return callback(err);

                Answer.findAnswerByIdAndPushPerson(answer._id, {
                  person_id: data.person_id
                }, err => {
                  if (err) return callback(err);

                  return callback(null);
                });
              });
            } else {
              Person.createAnswerGroup({
                question_id: question._id,
                company_id: data.company_id,
                answer_given_to_question: data.answer_given_to_question
              }, (err, id) => {
                if (err) return callback(err);

                Answer.findAnswerByIdAndPushPerson(id, {
                  person_id: data.person_id
                }, err => {
                  if (err) return callback(err);

                  return callback(null);
                });
              });
            };
          });
        });
      });
    });
  });
};

PersonSchema.statics.getNextQuestionForPerson = function (data, callback) {
  const Person = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const last_question_number = data.last_question && Number.isInteger(data.last_question) ? data.last_question : -1;

  Person.findPersonById(data.person_id, (err, person) => {
    if (err) return callback(err);

    Company.findCompanyById(data.company_id, (err, company) => {
      if (err) return callback(err);

      Question.findQuestionsByFiltersAndSorted({
        company_id: company._id,
        min_order_number: last_question_number,
        is_active: true
      }, (err, questions) => {
        if (err) return callback(err);
        let found_question = null;

        async.timesSeries(
          questions.length,
          (time, next) => {
            Answer.findOneAnswer({
              question_id: questions[time]._id,
              person_id: person._id
            }, err => {
              if (err && err != 'document_not_found') return next(err);
              if (!err) return next(null);
              found_question = questions[time];
              return next('process_complete');
            });
          },
          err => {
            if (err && err != 'process_complete')
              return callback(err);
            if (!err)
              return callback(null);

            Template.findTemplateById(found_question.template_id, (err, template) => {
              if (err) return callback(err);

              if (template.type != 'product')
                return callback(null, {
                  _id: found_question._id.toString(),
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

              Product.findProductById(found_question.product_id, (err, product) => {
                if (err) return callback(err);

                return callback(null, {
                  _id: found_question._id.toString(),
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
          }
        );
      });
    });
  });
};

PersonSchema.statics.getCumulativeResponsesForCompanyQuestions = function (data, callback) {
  const Person = this;

  Question.findQuestionsByFiltersAndSorted({
    company_id: data.company_id,
    is_active: true
  }, (err, questions) => {
    if (err) return callback(err);

    async.timesSeries(
      questions.length,
      (time, next) => {
        const question = questions[time];
        
        Template.findTemplateById(question.template_id, (err, template) => {
          if (err) return callback(err);

          if (template.type != 'product') {
            const graph = {
              question_type: template.type,
              title: template.name,
              description: 'Asked Question: ' + template.text,
              type: template.type == 'multiple' ? 'bar_chart' : 'pie_chart',
              data: [],
              total: 0
            };

            const choices = template.subtype == 'yes_no' ? ['yes', 'no'] : (['single', 'multiple', 'list'].includes(template.subtype) ? template.choices : Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString()));

            async.timesSeries(
              choices.length,
              (time, next) => {
                Answer.findAnswersAndCountUsers({
                  question_id: question._id,
                  answer_given_to_question: choices[time].toString().trim()
                }, (err, count) => {
                  if (err) return next(err);
                  
                  graph.data.push({
                    name: choices[time].toString().trim(),
                    value: count,
                  });
                  graph.total += count;
                  return next(null);
                })
              },
              err => {
                if (err) return next(err);

                graph.data.sort(function (x, y) {
                  if (x.value < y.value) return 1;
                  if (x.value > y.value) return -1;
                  return 0;
                });
                return next(null, graph);
              }
            );
          } else {
            Product.findProductById(question.product_id, (err, product) => {
              if (err) return callback(err);

              const graph = {
                question_type: template.type,
                title: template.name.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
                description: 'Asked Question: ' + template.text.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
                type: template.subtype == 'multiple' ? 'bar_chart' : 'pie_chart',
                data: [],
                total: 0
              };

              const choices = template.subtype == 'yes_no' ? ['yes', 'no'] : (['single', 'multiple', 'list'].includes(template.subtype) ? template.choices : Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString()));

              async.timesSeries(
                choices.length,
                (time, next) => {
                  Answer.findAnswersAndCountUsers({
                    question_id: question._id,
                    answer_given_to_question: choices[time].toString().trim()
                  }, (err, count) => {
                    if (err) return next(err);
                    
                    graph.data.push({
                      name: choices[time].toString().trim(),
                      value: count,
                    });
                    graph.total += count;
                    return next(null);
                  });
                },
                err => {
                  if (err) return next(err);
  
                  graph.data.sort(function (x, y) {
                    if (x.value < y.value) return 1;
                    if (x.value > y.value) return -1;
                    return 0;
                  });
                  return next(null, graph);
                }
              );
            });
          }
        })
      },
      (err, graphs) => {
        if (err) return callback(err);

        return callback(null, graphs.filter(each => each.data.length && each.data[0].value > 0));
      }
    );
  });
};

module.exports = mongoose.model('Person', PersonSchema);
