const Company = require('../../../models/company/Company');
const User = require('../../../models/user/User');

module.exports = (req, res) => {
  if (!req.body.company_role || req.body.company_role != 'admin') {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  Company.createCompany(req.body, (err, company_id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    req.body.company_id = company_id;

    User.createUser(req.body, (err, user_id) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      User.findUserByIdAndFormat(user_id, (err, user) => {
        if (err) {
          res.write(JSON.stringify({ error: err, success: false }));
          return res.end();
        }

        req.session.user = user;

        res.write(JSON.stringify({ redirect: req.session.redirect, success: true }));
        return res.end();
      });
    });
  });
}
