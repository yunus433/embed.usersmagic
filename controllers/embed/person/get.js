const Person = require('../../../models/person/Person');

module.exports = (req, res) => {
  Person.findOrCreatePersonByEmail(req.query.email, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}
