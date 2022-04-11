module.exports = (req, res) => {
  const graph = req.session.demo.graphs.find(each => each._id == req.query.id);
  graph.integration_path_id_list = req.body.integration_path_id_list;

  req.session.demo.graphs = req.session.demo.graphs.map(each => {
    if (each._id == graph._id)
      return graph;
    return each;
  });

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
