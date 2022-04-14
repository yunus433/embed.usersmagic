module.exports = (req, res) => {
  const user = req.session.demo.user;
  user.name == req.body.name && typeof req.body.name == 'string' ? req.body.name : user.name;

  if (!user.company_role || (user.company_role != 'admin' && user.company_role != 'manager')) {
    res.write(JSON.stringify({ success: true }));
    return res.end();
  }

  company.name = req.body.company_name && typeof req.body.company_name == 'string' ? req.body.company_name : company.name;
  company.preferred_color = req.body.preferred_color && typeof req.body.preferred_color == 'string' ? req.body.preferred_color : company.preferred_color;

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
