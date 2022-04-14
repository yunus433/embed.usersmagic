const User = require('../../../../../models/user/User');

module.exports = (req, res) => {
  User.findUserById(req.session.user._id, (err, user) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (!user.company_role || (user.company_role != 'admin' && user.company_role != 'manager')) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    req.body.company_id = req.session.user.company._id;

    if (!req.body.company_role || !['manager', 'user'].includes(req.body.company_role)) {
      res.write(JSON.stringify({ error: 'bad_request', success: false }));
      return res.end();
    }

    User.createUser(req.body, (err, id) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      res.write(JSON.stringify({ id, success: true }));
      return res.end();
    });
  });
}
