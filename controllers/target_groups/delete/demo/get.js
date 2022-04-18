module.exports = (req, res) => {
  req.session.demo.target_groups = req.session.demo.target_groups.filter(each => each._id != req.query.id);

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
