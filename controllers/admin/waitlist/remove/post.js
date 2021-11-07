const Company = require('../../../../models/company/Company');
const Question = require('../../../../models/question/Question');

module.exports = (req, res) => {
  Company.findCompanyByIdAndRemoveFromWaitlist(req.query.id, req.body, err => {
    if (err) {
      res.json({ success: false, 'error': err });
      return res.end();
    }

    Question.createQuestionsForDefaultTemplates(req.query.id, err => {
      if (err) {
        res.json({ success: false, 'error': err });
        return res.end();
      }

      res.json({ success: true });
      return res.end();
    });
  });
}
