module.exports = (req, res) => {
  const user = req.session.demo.team.find(each => each._id == req.query.id);

  if (!user) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ user, success: true }));
  return res.end();
}
