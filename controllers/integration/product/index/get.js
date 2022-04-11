const IntegrationPath = require('../../../../models/integration_path/IntegrationPath');

module.exports = (req, res) => {
  IntegrationPath.findIntegrationPathByProductId(req.query.product_id, (err, integration_path) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (integration_path.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ integration_path, success: true }));
    return res.end();
  });
}
