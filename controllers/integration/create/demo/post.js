const mongoose = require('mongoose');

module.exports = (req, res) => {
  const newIntegrationPathData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    type: req.body.type,
    signature: req.session.demo.company._id + req.body.name.toLocaleLowerCase().trim().split(' ').map(each => each.trim()).filter(each => each.length).join('_'),
    company_id: req.session.demo.company._id,
    name: req.body.name.trim(),
    path: req.body.path.trim(),
    product_id: req.body.type == 'product' ? req.body.product_id : null
  }

  req.session.demo.company.integration_paths.push(newIntegrationPathData);

  res.write(JSON.stringify({ id: newIntegrationPathData._id, success: true }));
  return res.end();
}
