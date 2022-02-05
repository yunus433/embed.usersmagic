const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  Question.findUnusedProductTemplatesForCompanyByProductId({
    company_id: req.session.user.company._id,
    product_id: req.query.id
  }, (err, templates) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ templates, success: true }));
    return res.end();
  })
}
