const validateDemoData = require('../utils/validateDemoData');

module.exports = (req, res, next) => {
  req.session.user = null; // Delete login info

  validateDemoData(req.session.demo, data => {
    data.user.company = data.company;
    req.session.demo = data;

    return next();
  });
}
