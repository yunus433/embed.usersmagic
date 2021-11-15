const Image = require('../../../models/image/Image');

module.exports = (req, res) => {
  if (!req.file || !req.file.filename) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  Image.createImage({
    file_name: req.file.filename
  }, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ url, success: true }));
    return res.end();
  });
}
