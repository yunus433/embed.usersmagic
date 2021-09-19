const Company = require('../../company/Company');

module.exports = (user, callback) => {
  if (!user || !user._id)
    return callback('bad_request');

  Company.findCompanyByIdAndFormat(user.company_id, (err, company) => {
    if (err) return callback(err);

    return callback(null, {
      _id: user._id.toString(),
      email: user.email,
      name: user.name || '',
      is_email_confirmed: user.is_email_confirmed,
      company
    });
  });
}
