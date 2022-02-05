const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getWeek = require('../../middleware/getWeek');

const LIMIT_FOR_ANSWER_DELETE = 1000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;

const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  template_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  question_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  answer_given_to_question: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  week_answer_is_given_in_unix_time: {
    type: Number,
    required: true
  },
  week_answer_will_be_outdated_in_unix_time: {
    type: Number,
    required: true
  },
  person_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  person_id_list_length: {
    type: Number,
    default: 0
  }
});

AnswerSchema.statics.findAnswerById = function (id, callback) {
  const Answer = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Answer.findById(mongoose.Types.ObjectId(id.toString()), (err, answer) => {
    if (err) return callback('database_error');
    if (!answer) return callback('document_not_found');

    return callback(null, answer);
  });
};

AnswerSchema.statics.findOneAnswer = function (data, callback) {
  const Answer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  getWeek(0, (err,  curr_week) => {
    if (err) return callback(err);

    const filters = {
      week_answer_will_be_outdated_in_unix_time: { $gte: curr_week }
    };

    if (data.template_id && validator.isMongoId(data.template_id.toString()))
      filters.template_id = mongoose.Types.ObjectId(data.template_id.toString());
  
    if (data.question_id && validator.isMongoId(data.question_id.toString()))
      filters.question_id = mongoose.Types.ObjectId(data.question_id.toString());

    if (data.person_id && validator.isMongoId(data.person_id.toString()))
      filters.person_id_list = data.person_id.toString();

    if (data.answer_given_to_question && typeof data.answer_given_to_question == 'string' && data.answer_given_to_question.trim().length)
      filters.answer_given_to_question = data.answer_given_to_question.trim();

    if (data.answer_given_to_question && Array.isArray(data.answer_given_to_question) && data.answer_given_to_question.length)
      filters.answer_given_to_question = { $in: data.answer_given_to_question};

    if (data.week_answer_is_given_in_unix_time && Number.isInteger(week_answer_is_given_in_unix_time))
      filters.week_answer_is_given_in_unix_time = week_answer_is_given_in_unix_time;

    if (data.person_id_list_not_full)
      filters.person_id_list_length = { $lt: MAX_DATABASE_ARRAY_FIELD_LENGTH };

    Answer
      .findOne(filters)
      .then(answer => {
        if (!answer) return callback('document_not_found');

        return callback(null, answer);
      })
      .catch(err => {console.log(err); callback('database_error')});
  });
};

AnswerSchema.statics.findAnswers = function (data, callback) { // Does not return answers' person_id_list
  const Answer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  getWeek(0, (err,  curr_week) => {
    if (err) return callback(err);

    const filters = {
      week_answer_will_be_outdated_in_unix_time: { $gte: curr_week }
    };

    if (data.template_id && validator.isMongoId(data.template_id.toString()))
      filters.template_id = mongoose.Types.ObjectId(data.template_id.toString());
  
    if (data.question_id && validator.isMongoId(data.question_id.toString()))
      filters.question_id = mongoose.Types.ObjectId(data.question_id.toString());

    if (data.person_id && validator.isMongoId(data.person_id.toString()))
      filters.person_id_list = data.person_id.toString();

    if (data.answer_given_to_question && typeof data.answer_given_to_question == 'string' && data.answer_given_to_question.trim().length)
      filters.answer_given_to_question = data.answer_given_to_question.trim();

    if (data.answer_given_to_question && Array.isArray(data.answer_given_to_question) && data.answer_given_to_question.length)
      filters.answer_given_to_question = { $in: data.answer_given_to_question};

    if (data.week_answer_is_given_in_unix_time && Number.isInteger(week_answer_is_given_in_unix_time))
      filters.week_answer_is_given_in_unix_time = week_answer_is_given_in_unix_time;

    if (data.person_id_list_not_full)
      filters.person_id_list_length = { $lt: MAX_DATABASE_ARRAY_FIELD_LENGTH };

    Answer
      .find(filters)
      .then(answers => {
        async.timesSeries(
          answers.length,
          (time, next) => {
            const answer = answers[time];

            return next(null, {
              _id: answer._id,
              template_id: answer.template_id,
              question_id: answer.question_id,
              answer_given_to_question: answer.answer_given_to_question,
              week_answer_is_given_in_unix_time: answer.week_answer_is_given_in_unix_time,
              week_answer_will_be_outdated_in_unix_time: answer.week_answer_will_be_outdated_in_unix_time,
              person_id_list_length: answer.person_id_list_length
            });
          },
          (err, answers) => {
            if (err)
              return callback(err);

            return callback(null, answers);
          }
        );
      })
      .catch(err => callback('database_error'));
  });
};

AnswerSchema.statics.findAnswerByIdAndPushPerson = function (id, data, callback) {
  const Answer = this;

  Answer.findAnswerById(id, (err, answer) => {
    if (err) return callback(err);

    if (!data || !data.person_id || !validator.isMongoId(data.person_id.toString()))
      return callback('bad_request');

    if (answer.person_id_list_length >= MAX_DATABASE_ARRAY_FIELD_LENGTH)
      return callback('bad_request');

    Answer.findByIdAndUpdate(answer._id, {
      $push: {
        person_id_list: data.person_id.toString().trim()
      },
      $inc: {
        person_id_list_length: 1
      }
    }, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AnswerSchema.statics.createAnswerWithoutProcessing = function (data, callback) {
  const Answer = this;

  const newAnswer = new Answer(data);

  newAnswer.save((err, answer) => {
    if (err) return callback('database_error');

    return callback(null, answer._id.toString());
  });
};

AnswerSchema.statics.deleteOutdatedAnswers = function (callback) {
  const Answer = this;

  getWeek(0, (err, curr_week) => {
    if (err) return callback(err);

    Answer
      .find({
        week_answer_will_be_outdated_in_unix_time: { $lt: curr_week }
      })
      .limit(LIMIT_FOR_ANSWER_DELETE)
      .then(answers => {
        async.timesSeries(
          answers.length,
          (time, next) => Answer.findByIdAndDelete(answers[time]._id, err => {
              if (err) return next('database_error');

              return next(null);
          }),
          err => {
            if (err) return callback(err);

            return callback(null);
          }
        )
      })
      .catch(err => callback('database_error'));
  });
};

AnswerSchema.statics.checkAnswerExists = function (data, callback) {
  const Answer = this;

  if (!data || typeof data != 'object')
    return callback(false);

  getWeek(0, (err,  curr_week) => {
    if (err) return callback(err);

    const filters = {
      week_answer_will_be_outdated_in_unix_time: { $gte: curr_week }
    };

    if (data.question_id && validator.isMongoId(data.question_id.toString()))
      filters.question_id = mongoose.Types.ObjectId(data.question_id.toString());
  
    if (data.person_id && validator.isMongoId(data.person_id.toString()))
      filters.person_id_list = data.person_id.toString();
  
    if (data.answer_given_to_question && typeof data.answer_given_to_question == 'string' && data.answer_given_to_question.trim().length)
      filters.answer_given_to_question = data.answer_given_to_question.trim();
  
    if (data.week_answer_is_given_in_unix_time && Number.isInteger(data.week_answer_is_given_in_unix_time))
      filters.week_answer_is_given_in_unix_time = data.week_answer_is_given_in_unix_time;
  
    if (data.person_id_list_not_full)
      filters.person_id_list_length = { $lt: MAX_DATABASE_ARRAY_FIELD_LENGTH };
  
    Answer
      .find(filters)
      .countDocuments()
      .then(number => callback(number > 0 ? true : false))
      .catch(err => callback(false));
  });
};

AnswerSchema.statics.findAnswersAndCountUsersByFilters = function (data, callback) {
  const Answer = this;

  Answer.findAnswers(data, (err, answers) => {
    if (err && err != 'document_not_found') return callback(err);

    let user_count = 0;
  
    async.timesSeries(
      answers.length,
      (time, next) => {
        user_count += answers[time].person_id_list_length;
        return next(null);
      },
      err => {
        if (err) return callback('unknown_error');

        return callback(null, user_count);
      }
    );
  });
};

module.exports = mongoose.model('Answer', AnswerSchema);
