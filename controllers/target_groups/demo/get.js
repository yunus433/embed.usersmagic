module.exports = (req, res) => {
  const target_group = req.session.demo.target_groups.find(each => each._id == req.query.id);

  if (!target_group) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ target_group, success: true }));
  return res.end();
}
