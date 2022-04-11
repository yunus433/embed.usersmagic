module.exports = (req, res) => {
  req.session.demo.questions = req.session.demo.questions.filter(each => each._id != req.query.id);
  req.session.demo.graphs = req.session.demo.graphs.filter(each => each._id != req.query.id);

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
