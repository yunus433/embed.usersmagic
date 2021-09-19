const User = require('../models/user/User');

module.exports = (req, res, next) => {
  User.findUserById(req.session.user._id, (err, user) => {
    if (err) return res.redirect('/auth/login');

    if (user.is_email_confirmed)
      return next();

    return res.redirect('/auth/confirm');
  });
}
