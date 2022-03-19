const TargetGroup = require('../../../models/target_group/TargetGroup');

module.exports = (req, res) => {
  TargetGroup.findTargetGroupByIdAndFormat(req.query.id, (err, target_group) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }
    if (target_group.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, target_group }));
    return res.end();
  });
}
