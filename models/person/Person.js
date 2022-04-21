const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Answer = require('../answer/Answer');
const Product = require('../product/Product');
const Template = require('../template/Template');
const Question = require('../question/Question');

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

PersonSchema.statics.getCumulativeResponsesForQuestionById = function (data, callback) {
  const Person = this;

  Question.findQuestionById(data.question_id, (err, question) => {
    if (err) return callback(err);

    Template.findTemplateById(question.template_id, (err, template) => {
      if (err) return callback(err);

      if (template.type != 'product') {
        const graph = {
          _id: question._id.toString(),
          question_type: template.type,
          integration_path_id_list: question.integration_path_id_list,
          title: template.name,
          description: template.text,
          type: template.type == 'multiple' ? 'bar_chart' : 'pie_chart',
          data: [],
          created_at: question.created_at,
          is_active: question.is_active,
          total: 0
        };

        const choices = template.subtype == 'yes_no' ? ['yes', 'no'] : (['single', 'multiple', 'list', 'time'].includes(template.subtype) ? template.choices : Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString()));

        async.timesSeries(
          choices.length,
          (time, next) => {
            data.answer_given_to_question = choices[time].toString().trim();

            Answer.findAnswersAndCountUsersByFilters(data, (err, count) => {
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
            if (err) return callback(err);

            graph.data.sort(function (x, y) {
              if (x.value < y.value) return 1;
              if (x.value > y.value) return -1;
              return 0;
            });

            return callback(null, graph);
          }
        );
      } else {
        Product.findProductById(question.product_id, (err, product) => {
          if (err) return callback(err);

          const graph = {
            _id: question._id.toString(),
            question_type: template.type,
            integration_path_id_list: question.integration_path_id_list,
            title: template.name.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
            description: template.text.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
            type: template.subtype == 'multiple' ? 'bar_chart' : 'pie_chart',
            data: [],
            created_at: question.created_at,
            is_active: question.is_active,
            total: 0
          };

          const choices = template.subtype == 'yes_no' ? ['yes', 'no'] : (['single', 'multiple', 'list', 'time'].includes(template.subtype) ? template.choices : Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString()));

          async.timesSeries(
            choices.length,
            (time, next) => {
              data.answer_given_to_question = choices[time].toString().trim();

              Answer.findAnswersAndCountUsersByFilters(data, (err, count) => {
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
              if (err) return callback(err);
  
              graph.data.sort(function (x, y) {
                if (x.value < y.value) return 1;
                if (x.value > y.value) return -1;
                return 0;
              });
              return callback(null, graph);
            }
          );
        });
      }
    });
  });
};

PersonSchema.statics.getCumulativeResponsesForCompanyQuestions = function (data, callback) {
  const Person = this;

  Question.findQuestionsByFiltersAndSorted({
    company_id: data.company_id
  }, (err, questions) => {
    if (err) return callback(err);

    async.timesSeries(
      questions.length,
      (time, next) => {
        const question = questions[time];

        data.question_id = question._id;

        Person.getCumulativeResponsesForQuestionById(data, (err, graph) => {
          if (err) return next(err);

          return next(null, graph);
        });
      },
      (err, graphs) => {
        if (err) return callback(err);

        return callback(null, graphs);
      }
    );
  });
};

PersonSchema.statics.getCSVDataForQuestionById = function (data, callback) {
  const Person = this;

  Person.getCumulativeResponsesForQuestionById(data, (err, graph) => {
    if (err) return callback(err);

    const data = [
      {
        choices: 'Total',
        count: graph.total
      }
    ];

    for (let i = 0; i < graph.data.length; i++)
      data.push({
        choices: graph.data[i].name,
        count: graph.data[i].value
      });

    return callback(null, data);
  });
};

PersonSchema.statics.getAnswerCountForQuestionByIdAndFilters = function (data, callback) {
  const Person = this;

  if (!data || !data.allowed_answers || !Array.isArray(data.allowed_answers))
    return callback('bad_request');

  Question.findQuestionById(data.question_id, (err, question) => {
    if (err) return callback(err);

    Template.findTemplateById(question.template_id, (err, template) => {
      if (err) return callback(err);

      const choices = template.subtype == 'yes_no' ? ['yes', 'no'] : (['single', 'multiple', 'list', 'time'].includes(template.subtype) ? template.choices : Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString()));
      let total = 0, match = 0;

      async.timesSeries(
        choices.length,
        (time, next) => {
          data.answer_given_to_question = choices[time].toString().trim();
  
          Answer.findAnswersAndCountUsersByFilters(data, (err, count) => {
            if (err) return next(err);
            
            total += count;
            if (data.allowed_answers.includes(choices[time].toString().trim()))
              match += count;
  
            return next(null);
          });
        },
        err => {
          if (err) return callback(err);

          return callback(null, {
            total, match
          });
        }
      );
    });
  });
}

module.exports = mongoose.model('Person', PersonSchema);
