module.exports = (req, res) => {
  res.write(JSON.stringify({ success: true }));
  return res.end();
}
