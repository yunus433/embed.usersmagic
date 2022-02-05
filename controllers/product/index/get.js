const Product = require('../../../models/product/Product');

module.exports = (req, res) => {
  Product.findProductById(req.query.id, (err, product) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (product.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ product, success: true }));
    return res.end();
  });
}
