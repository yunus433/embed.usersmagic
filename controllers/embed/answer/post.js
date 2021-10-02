const Person = require('../../../models/person/Person');

module.exports = (req, res) => {
  if (!req.body || typeof req.body != 'object') {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  Person.findOrCreatePersonByEmail(req.query.email, (err, person) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    Person.pushPersonToAnswerGroup({
      answer_given_to_question: req.body.answer_given_to_question,
      person_id: person._id,
      company_id: req.session.company_id,
      question_id: req.body.question_id
    }, (err) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  });
}
