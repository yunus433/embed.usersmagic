const Company = require('../models/company/Company');

module.exports = (req, res, next) => {
  if (req.session && req.session.company_id)
    return next();

  Company.findCompanyByDomain('stumarkt.com', (err, company) => {
    if (err) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    req.session.company_id = company._id.toString();

    return next();
  });
}