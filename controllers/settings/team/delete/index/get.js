const User = require('../../../../../models/user/User');

module.exports = (req, res) => {
  User.findUserById(req.session.user._id, (err, admin) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (!admin.company_role || admin.company_role != 'admin') {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    User.findUserById(req.query.id, (err, user) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      if (user._id.toString() == admin._id.toString()) {
        res.write(JSON.stringify({ error: 'bad_request', success: false }));
        return res.end();
      }
  
      if (admin.company_id.toString() != user.company_id.toString()) {
        res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
        return res.end();
      }
  
      User.findUserByIdAndDelete(req.query.id, err => {
        if (err) {
          res.write(JSON.stringify({ error: err, success: false }));
          return res.end();
        }
  
        res.write(JSON.stringify({ success: true }));
        return res.end();
      });
    });
  });
}
