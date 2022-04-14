module.exports = (req, res) => {
  if (req.query.id == req.session.demo.user._id) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  req.session.demo.team = req.session.demo.team.filter(each => each._id != req.query.id);

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
