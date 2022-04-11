module.exports = (req, res) => {
  const ad = req.session.demo.ads.find(each => each._id == req.query.id);
  ad.integration_path_id_list = req.body.integration_path_id_list;

  req.session.demo.ads = req.session.demo.ads.map(each => {
    if (each._id == ad._id)
      return ad;
    return each;
  });

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
