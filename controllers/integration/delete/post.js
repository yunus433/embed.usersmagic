const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyByIdAndDeleteIntegrationRouteById(req.session.user.company._id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
