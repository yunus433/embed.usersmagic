module.exports = (req, res) => {
  res.write(JSON.stringify({
    company: req.session.user.company,
    success: true
  }));
  
  return res.end();
}
