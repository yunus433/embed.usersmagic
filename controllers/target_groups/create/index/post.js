const TargetGroup = require('../../../../models/target_group/TargetGroup');

module.exports = (req, res) => {
  req.body.company_id = req.session.user.company._id;

  TargetGroup.createTargetGroup(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
}
