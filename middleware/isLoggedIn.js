const User = require('../models/user/User');

module.exports = (req, res, next) => {
  if (req.session && req.session.user) { // If logged in
    User.findUserByIdAndFormat(req.session.user._id, (err, user) => {
      if (err) return res.status(401).redirect('/auth/login');;
      
      req.session.user = user;
      return next();
    });
  } else {
    if (req.file && req.file.filename) {
      fs.unlink('./public/res/uploads/' + req.file.filename, () => {
        req.session.redirect = req.originalUrl;
        return res.status(401).redirect('/auth/login');
      });
    } else {
      req.session.redirect = req.originalUrl;
      return res.status(401).redirect('/auth/login');
    }
  };
};
