const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyByIdAndDeleteDomainAndWaitingDomain(req.session.user.company._id, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
