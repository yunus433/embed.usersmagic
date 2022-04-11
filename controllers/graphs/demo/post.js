module.exports = (req, res) => {
  res.write(JSON.stringify({ graphs: req.session.demo.graphs, success: true }));
    return res.end();
}
