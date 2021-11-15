const Image = require('../../../models/image/Image');

module.exports = (req, res) => {
  Image.findImageByUrlAndDelete(req.query.url, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
