const Ad = require('../../../../models/ad/Ad');

module.exports = (req, res) => {
  Ad.findTargetGroupByIdAndCompanyIdAndDelete(req.query.id, req.session.user.company._id, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
