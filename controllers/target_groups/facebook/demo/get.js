module.exports = (req, res) => {
  return res.json({
    "error": "You cannot export a facebook data in demo mode, please create an account first."
  });
}
