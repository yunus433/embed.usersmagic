const mongoose = require('mongoose');
const validator = require('validator');

module.exports = (req, res) => {
  if (!req.body.email || !validator.isEmail(req.body.email)) {
    res.write(JSON.stringify({ error: 'email_validation', success: false }));
    return res.end();
  }

  if (!req.body.password || typeof req.body.password != 'string' || !req.body.password.trim().length) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  if (req.body.password.trim().length < 6) {
    res.write(JSON.stringify({ error: 'password_length', success: false }));
    return res.end();
  }

  if (!req.body.company_role || !['manager', 'user'].includes(req.body.company_role)) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  const newMember = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    email: req.body.email.trim(),
    password: req.body.password.trim(),
    is_email_confirmed: true,
    company_role: req.body.company_role
  };

  req.session.demo.team.push(newMember);

  res.write(JSON.stringify({ id: newMember._id, success: false }));
  return res.end();
}
