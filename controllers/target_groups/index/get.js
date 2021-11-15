const TargetGroup = require('../../../models/target_group/TargetGroup');

module.exports = (req, res) => {
  TargetGroup.findTargetGroupById(req.query.id, (err, target_group) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, target_group }));
    return res.end();
  });
}
