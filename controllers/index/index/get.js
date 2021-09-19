const Product = require('../../../models/product/Product');
const Question = require('../../../models/question/Question');

module.exports = (req, res) => {
  Question.findQuestionsForCompany(req.session.user.company._id, (err, questions_data) => {
    if (err) return res.redirect('/auth/login');

    Product.findProductsByCompanyId(req.session.user.company._id, (err, products) => {
      if (err) return res.redirect('/auth/login');

      return res.render('index/index', {
        page: 'index/index',
        title: 'Dashboard',
        includes: {
          external: {
            css: ['dashboard', 'fontawesome', 'general', 'page'],
            js: ['page', 'serverRequest']
          }
        },
        pie_chart_colors: [
          'rgba(92, 196, 110, 1)',
          'rgba(45, 136, 196, 1)',
          'rgba(237, 72, 80, 1)',
          'rgba(254, 211, 85, 1)'
        ],
        questions_data,
        products
      });
    });
  });
}
