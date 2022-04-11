module.exports = (req, res) => {
  let demo = req.session.demo;

  demo.ads = demo.ads.map(each => {
    if (each._id != req.query.id)
      return each;

    each.is_active = false;

    return each;
  });

  req.session.demo.ads = demo.ads;
  res.write(JSON.stringify({ success: true }));
  return res.end();
}
