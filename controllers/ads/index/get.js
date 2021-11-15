const Ad = require('../../../models/ad/Ad');

module.exports = (req, res) => {
  Ad.findAdById(req.query.id, (err, ad) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, ad }));
    return res.end();
  });
}
