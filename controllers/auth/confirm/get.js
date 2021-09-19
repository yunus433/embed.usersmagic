const User = require('../../../models/user/User');

module.exports = (req, res) => {
  const user = req.session.user;

  if (user.is_email_confirmed)
    return res.redirect('/');

  User.findUserByIdAndSendConfirmationCode(user._id, (err, exp_unix_time) => {
    if (err) return res.redirect('/auth/login');
    
    return res.render('auth/confirm', {
      page: 'auth/confirm',
      title: 'Confirm',
      includes: {
        external: {
          css: ['page', 'general', 'auth'],
          js: ['page', 'serverRequest']
        }
      },
      exp_unix_time,
      user
    });
  });
}
