const Product = require('../../../../models/product/Product');

module.exports = (req, res) => {
  req.body.company_id = req.session.user.company._id;

  Product.createProduct(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ id, success: true }));
    return res.end();
  });
}
