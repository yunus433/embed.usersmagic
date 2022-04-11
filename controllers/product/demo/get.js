module.exports = (req, res) => {
  const product = req.session.demo.products.find(each => each._id == req.query.id);

  if (!product) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  res.write(JSON.stringify({ product, success: true }));
  return res.end();
}
