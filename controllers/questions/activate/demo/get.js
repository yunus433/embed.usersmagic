module.exports = (req, res) => {
  let demo = req.session.demo;

  demo.graphs = demo.graphs.map(each => {
    if (each._id != req.query.id)
      return each;

    each.is_active = true;

    return each;
  });

  req.session.demo.graphs = demo.graphs;
  res.write(JSON.stringify({ success: true }));
  return res.end();
}
