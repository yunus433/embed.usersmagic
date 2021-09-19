const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyByIdAndVerifyWaitingDomain(req.session.user.company._id, (err, res) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ result: res, success: true }));
    return res.end();
  });
}
