const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  Question.findQuestionByIdAndFormat(req.query.id, (err, question) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, question }));
    return res.end();
  });
}
