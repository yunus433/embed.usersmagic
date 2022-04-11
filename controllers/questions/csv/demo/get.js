const json2csv = require('json-2-csv');

module.exports = (req, res) => {
  const graph = req.session.demo.graphs.find(each => each._id == req.query.id);

  json2csv.json2csv(graph.data, (err, csv) => {
    if (err) return res.redirect('/');

    return res.attachment(`${graph.title} (Usersmagic Question Data).csv`).send(csv);
  });
}
