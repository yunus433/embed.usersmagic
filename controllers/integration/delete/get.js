const IntegrationPath = require('../../../models/integration_path/IntegrationPath');
const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  const company = req.session.user.company;

  IntegrationPath.findIntegrationPathById(req.query.id, (err, integration_path) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (integration_path.company_id.toString() != company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    if (integration_path.type == 'product') {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    Question.findQuestionsByIntegrationPathId(integration_path._id, (err, questions) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      if (questions && questions.length) {
        res.write(JSON.stringify({ error: 'document_still_used', success: false }));
        return res.end();
      }

      IntegrationPath.findIntegrationPathByIdAndDelete(integration_path._id, err => {
        if (err) {
          res.write(JSON.stringify({ error: err, success: false }));
          return res.end();
        }

        res.write(JSON.stringify({ success: true }));
        return res.end();
      });
    });
  });
}
