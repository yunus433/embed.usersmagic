const User = require('../../../../models/user/User');

module.exports = (req, res) => {
  User.findUserById(req.query.id, (err, user) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (user.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ user, success: true }));
    return res.end();
  });
}
