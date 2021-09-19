module.exports = (req, res, next) => {
  if (process.env.IS_ADMIN)
    return next();

  return res.redirect('/');
}
