const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyByIdAndUpdateWaitingDomain(req.session.user.company._id, req.body, (err, domain) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ domain, success: true }));
    return res.end();
  });
}
