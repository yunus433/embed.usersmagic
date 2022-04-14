const User = require('../../../models/user/User');

module.exports = (req, res) => {
  req.session.user = null;
  return res.redirect('/auth/login');
}
