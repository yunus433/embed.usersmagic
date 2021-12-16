const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyByIdAndCreateIntegrationRoute(req.session.user.company._id, req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ id, success: true }));
    return res.end();
  });
}
