const Template = require('../../../../models/template/Template');

module.exports = (req, res) => {
  Template.createTemplate(req.body, (err, id) => {
    if (err) {
      res.json({ success: false, 'error': err });
      return res.end();
    }

    res.json({ success: true, id });
    return res.end();
  });
}
