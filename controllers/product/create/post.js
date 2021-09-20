const Product = require('../../../models/product/Product');
const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  req.body.company_id = req.session.user.company._id;

  Product.createProduct(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    Question.createQuestionsForCompany(req.session.user.company._id, err => {
      if (err) {
        res.json({ success: false, 'error': err });
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  });
}
