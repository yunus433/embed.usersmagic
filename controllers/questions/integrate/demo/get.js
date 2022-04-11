module.exports = (req, res) => {
  const graph = req.session.demo.graphs.find(each => each._id == req.query.id);
  const integration_path_list = req.session.demo.company.integration_path_list.filter(each => graph.integration_path_id_list.includes(each._id));

  res.write(JSON.stringify({ success: true, integration_path_list }));
  return res.end();
}
