const Company = require('../models/company/Company');
const User = require('../models/user/User');

module.exports = (req, res, next) => {
  User.findUserById(req.session.user._id, (err, user) => {
    if (err) return res.redirect('/auth/login');

    Company.findCompanyById(user.company_id, (err, company) => {
      if (!company.is_on_waitlist)
        return next();

      return res.redirect('/waitlist');
    });
  });
}
