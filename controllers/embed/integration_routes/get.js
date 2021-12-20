const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  Company.findCompanyById(req.session.company_id, (err, company) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }
    
    res.write(JSON.stringify({ integration_routes: company.integration_routes, success: true }));
    return res.end();
  });
}
