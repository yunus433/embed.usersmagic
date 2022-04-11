const Ad = require('../../../../models/ad/Ad');

module.exports = (req, res) => {
  req.body.company_id = req.session.user.company._id;

  Ad.createAd(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
}
