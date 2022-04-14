const User = require('../../../models/user/User');

module.exports = (req, res) => {
  User.findUserByEmailAndVerifyPassword(req.body, (err, user) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    User.findUserByIdAndFormat(user._id, (err, user) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      req.session.user = user;

      res.write(JSON.stringify({ redirect: req.session.redirect, success: true }));
      return res.end();
    });
  });
}
