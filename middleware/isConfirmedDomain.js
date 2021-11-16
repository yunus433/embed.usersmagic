const url = require('url');

const Company = require('../models/company/Company');

module.exports = (req, res, next) => {
  if (req.session && req.session.company_id)
    return next();

  const hostname =  url.parse(req.get('origin')).hostname;
  // const hostname = 'stumarkt.com';

  Company.findCompanyByDomain(hostname, (err, company) => {
    if (err) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    req.session.company_id = company._id.toString();

    return next();
  });
}
