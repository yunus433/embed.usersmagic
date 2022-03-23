const Ad = require('../../../models/ad/Ad');

module.exports = (req, res) => {
  Ad.findAdById(req.query.id, (err, ad) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (ad.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    Ad.findAdByIdAndUpdateIntegrationPathIdList(req.query.id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }
  
      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  });
}
