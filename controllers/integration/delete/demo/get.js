module.exports = (req, res) => {
  const questions = req.session.demo.graphs.find(each => each.integration_path_id_list.includes(req.query.id));

  if (questions && questions.length) {
    res.write(JSON.stringify({ error: 'document_still_used', success: false }));
    return res.end();
  }

  req.session.demo.company.integration_paths = req.session.demo.company.integration_paths.filter(each => each._id != req.query.id);

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
