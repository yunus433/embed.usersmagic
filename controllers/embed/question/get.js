const Person = require('../../../models/person/Person');

module.exports = (req, res) => {
  Person.findOrCreatePersonByEmail(req.query.email, (err, person) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    Person.getNextQuestionForPerson({
      last_question: req.query.last_question && !isNaN(parseInt(req.query.last_question)) ? parseInt(req.query.last_question) : 0,
      person_id: person._id,
      company_id: req.session.company_id
    }, (err, question) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      res.write(JSON.stringify({ question, success: true }));
      return res.end();
    });
  });
}
