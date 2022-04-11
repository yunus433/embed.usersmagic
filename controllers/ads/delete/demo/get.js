module.exports = (req, res) => {
  req.session.demo.ads = req.session.demo.ads.filter(each => each._id != req.query.id);

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
