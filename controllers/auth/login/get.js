module.exports = (req, res) => {
  return res.render('auth/login', {
    page: 'auth/login',
    title: 'Login',
    includes: {
      external: {
        css: ['page', 'general', 'auth'],
        js: ['page', 'serverRequest']
      }
    }
  });
}
