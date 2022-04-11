const mongoose = require('mongoose');

module.exports = (req, res) => {
  if (!req.body.description)
    req.body.description = '---';

  const newTargetGroupData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    company_id: req.session.demo.company._id,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    filters: req.body.filters
  };

  req.session.demo.target_groups.push(newTargetGroupData);

  res.write(JSON.stringify({ success: true, id: newTargetGroupData._id }));
  return res.end();
}
