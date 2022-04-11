module.exports = (req, res) => {
  const ad = req.session.demo.ads.find(each._id == req.query.id);

  if (!ad) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ success: true, ad }));
  return res.end();
}
