const Question = require('../../../../models/question/Question');

module.exports = (req, res) => {
  Question.findQuestionByIdAndCompanyIdAndDelete(req.query.id, req.session.user.company._id, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
