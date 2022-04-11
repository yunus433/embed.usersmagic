const Person = require('../../../models/person/Person');

module.exports = (req, res) => {
  req.body.company_id = req.session.user.company._id;

  Person.getCumulativeResponsesForCompanyQuestions(req.body, (err, graphs) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ graphs, success: true }));
    return res.end();
  }); 
}
