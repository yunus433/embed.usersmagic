module.exports = (req, res) => {
  const templates = req.session.demo.templates.filter(template => !req.session.demo.questions.find(question => question.product_id == req.query.id && question.template_id == req.query.id));

  res.write(JSON.stringify({ templates, success: true }));
  return res.end();
}
