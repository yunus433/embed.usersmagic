module.exports = (req, res) => {
  const question = req.session.demo.questions.find(each._id == req.query.id);

  if (!question) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ success: true, question }));
  return res.end();
}
