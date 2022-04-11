module.exports = (req, res) => {
  const integration_path = req.session.demo.company.integration_paths.find(each => each.product_id == req.query.product_id);

  if (!integration_path) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ integration_path, success: true }));
  return res.end();
}
