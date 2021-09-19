module.exports = (req, res) => {
  return res.render('auth/register', {
    page: 'auth/register',
    title: 'Register',
    includes: {
      external: {
        css: ['general', 'auth'],
        js: ['page', 'serverRequest']
      }
    }
  });
}
