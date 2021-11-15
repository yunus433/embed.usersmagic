const Company = require('../../../models/company/Company');
const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  const company_id = req.session.user.company._id;

  Question.findQuestionsForCompanyAndDelete(company_id, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    Company.findCompanyByIdAndUpdatePreferredLanguage(company_id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      Question.createQuestionsForDefaultTemplates(company_id, err => {
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
