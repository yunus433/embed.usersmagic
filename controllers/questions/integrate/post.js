const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  Question.findQuestionById(req.query.id, (err, question) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    if (question.company_id.toString() != req.session.user.company._id.toString()) {
      res.write(JSON.stringify({ error: 'not_authenticated_request', success: false }));
      return res.end();
    }

    Question.findQuestionByIdAndUpdateIntegrationPathIdList(req.query.id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }
  
      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  });
}
