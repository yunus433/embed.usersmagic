const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const sendEmail = require('../../utils/sendEmail');

const Company = require('../company/Company');

const hashPassword = require('./functions/hashPassword');
const getUser = require('./functions/getUser');
const verifyPassword = require('./functions/verifyPassword');

const company_roles = ['admin', 'manager', 'user'];

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MIN_PASSWORD_LENGTH = 6;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const FIVE_MIN_IN_MS = 5 * 60 * 1000;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  company_role: {
    type: String,
    default: 'user'
  },
  email: {
    type: String,
    unique: true,
    index: true,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_email_confirmed: {
    type: Boolean,
    default: false
  },
  email_confirmation_code: {
    type: Number,
    default: null
  },
  email_confirmation_code_exp_date: {
    type: Number,
    default: null
  },
  password: {
    type: String,
    required: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  name: {
    type: String,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    default: null
  }
});

UserSchema.pre('save', hashPassword);

UserSchema.statics.findUserByEmailAndVerifyPassword = function (data, callback) {
  const User = this;

  if (!data || !data.email || !validator.isEmail(data.email) || !data.password)
    return callback('bad_request');

  User.findOne({
    email: data.email.trim()
  }, (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    verifyPassword(data.password.trim(), user.password, res => {
      if (!res) return callback('password_verification');

      return callback(null, user);
    });
  });
};

UserSchema.statics.findUserById = function (id, callback) {
  const User = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  User.findById(mongoose.Types.ObjectId(id.toString()), (err, user) => {
    if (err) return callback('database_error');
    if (!user) return callback('document_not_found');

    return callback(null, user);
  });
};

UserSchema.statics.findUserByIdAndFormat = function (id, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    getUser(user, (err, user) => {
      if (err) return callback(err);

      return callback(null, user);
    });
  });
};

UserSchema.statics.findUserByIdAndDelete = function (id, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    User.findByIdAndDelete(user._id, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

UserSchema.statics.findUserByIdAndUpdate = function (id, data, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    User.findByIdAndUpdate(user._id, {
      name: data.name && typeof data.name == 'string' && data.name.length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : user.name 
    }, err => {
      if (err) return callback(err);

      return callback(null);
    });
  });
};

UserSchema.statics.findUserByIdAndUpdatePassword = function (id, data, callback) {
  const User = this;

  if (!data || !data.old_password || !data.password)
    return callback('bad_request');

  if (!data.password.length || data.password.length < MIN_PASSWORD_LENGTH)
    return callback('password_length');

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    User.findUserByEmailAndVerifyPassword({
      email: user.email,
      password: data.old_password
    }, (err, user) => {
      if (err) return callback(err);

      user.password = data.password;

      user.save(err => {
        if (err) return callback('database_error');

        return callback(null);
      });
    });
  });
};

UserSchema.statics.createUser = function (data, callback) {
  const User = this;

  if (!data || !data.company_id || !data.email || !data.password)
    return callback('bad_request')

  data.password = data.password.trim();

  if (!validator.isEmail(data.email))
    return callback('email_validation');

  if (data.password.length < MIN_PASSWORD_LENGTH)
    return callback('password_length');

  if (!data.company_role || !company_roles.includes(data.company_role))
    return callback('bad_request');
  
  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);

    const newUserData = {
      company_id: company._id,
      email: data.email.trim(),
      password: data.password.trim(),
      company_role: data.company_role
    };

    const newUser = new User(newUserData);

    newUser.save((err, user) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err)
        return callback('database_error');

      return callback(null, user._id.toString());
    });
  });  
};

UserSchema.statics.findUserByIdAndSendConfirmationCode = function (id, callback) {
  const User = this;

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);
    if (user.is_email_confirmed) return callback(null);

    const confirmation_code = Math.round(Math.random() * 1e6) + 1e5;
    const exp_date = ((new Date).getTime()) + FIVE_MIN_IN_MS;

    User.findByIdAndUpdate(user._id, {$set: {
      email_confirmation_code: confirmation_code,
      email_confirmation_code_exp_date: exp_date
    }}, err => {
      if (err) return callback('database_error');

      sendEmail({
        template: 'confirmation_code',
        to: user.email,
        email: user.email,
        code: confirmation_code
      }, err => {
        if (err) return callback(err);

        return callback(null, exp_date);
      });
    });
  });
};

UserSchema.statics.findUserByIdAndConfirmEmail = function (id, data, callback) {
  const User = this;

  if (!data.code)
    return callback('bad_request');

  User.findUserById(id, (err, user) => {
    if (err) return callback(err);

    if (user.is_email_confirmed)
      return callback('already_authenticated');

    if (user.email_confirmation_code != data.code)
      return callback('bad_request');

    if (user.email_confirmation_code_exp_date < (new Date).getTime())
      return callback('request_timeout');
    
    User.findByIdAndUpdate(user._id, {$set: {
      is_email_confirmed: true,
      email_confirmation_code: null,
      email_confirmation_code_exp_date: null
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

UserSchema.statics.findUsersByCompanyId = function (company_id, callback) {
  const User = this;

  if (!company_id || !validator.isMongoId(company_id.toString()))
    return callback('bad_request');

  User.find({
    company_id: mongoose.Types.ObjectId(company_id.toString())
  }, (err, users) => {
    if (err) return callback('database_error');

    async.timesSeries(
      users.length,
      (time, next) => getUser(users[time], (err, user) => next(err, user)),
      (err, users) => {
        if (err) return callback(err);

        return callback(null, users);
      }
    );
  });
};

module.exports = mongoose.model('User', UserSchema);
