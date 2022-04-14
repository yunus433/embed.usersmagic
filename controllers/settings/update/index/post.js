const Company = require('../../../../models/company/Company');
const User = require('../../../../models/user/User')

module.exports = (req, res) => {
  const user = req.session.user;

  User.findUserByIdAndUpdate(user._id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (!user.company_role || (user.company_role != 'admin' && user.company_role != 'manager')) {
      res.write(JSON.stringify({ success: true }));
      return res.end();
    }
  
    Company.findCompanyByIdAndUpdate(req.session.user.company._id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  });
}
