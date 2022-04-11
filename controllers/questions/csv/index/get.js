const json2csv = require('json-2-csv');

const Person = require('../../../../models/person/Person');
const Question = require('../../../../models/question/Question');

module.exports = (req, res) => {
  Question.findQuestionByIdAndFormat(req.query.id, (err, question) => {
    if (err) return res.redirect('/');

    if (question.company_id.toString() != req.session.user.company._id.toString())
      return res.redirect('/');

    Person.getCSVDataForQuestionById({
      question_id: req.query.id
    }, (err, data) => {
      if (err) return res.redirect('/');

      json2csv.json2csv(data, (err, csv) => {
        if (err) return res.redirect('/');
    
        return res.attachment(`${question.name} (Usersmagic Question Data).csv`).send(csv);
      });
    });
  });
}
