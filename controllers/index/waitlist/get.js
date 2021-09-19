const Company = require('../../../models/company/Company');

module.exports = (req, res) => {
  const company = req.session.user.company;

  if (!company.is_on_waitlist)
    return res.redirect('/');

  if (!company.waiting_domain || company.domain)
    return res.render('index/waitlist', {
      page: 'index/waitlist',
      title: 'Waitlist',
      includes: {
        external: {
          css: ['confirm', 'dashboard', 'fontawesome', 'page', 'general', 'text'],
          js: ['confirm', 'page', 'serverRequest']
        }
      },
      user: req.session.user
    });

  Company.findCompanyByIdAndVerifyWaitingDomain(company._id, (err, result) => {
    if (!err && result) return res.redirect('/');

    return res.render('index/waitlist', {
      page: 'index/waitlist',
      title: 'Waitlist',
      includes: {
        external: {
          css: ['confirm', 'page', 'general', 'dashboard', 'fontawesome', 'text'],
          js: ['confirm', 'page', 'serverRequest']
        }
      },
      user: req.session.user
    });
  });
}

