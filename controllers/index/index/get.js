const Ad = require('../../../models/ad/Ad');
const Product = require('../../../models/product/Product');
const Question = require('../../../models/question/Question');
const TargetGroup = require('../../../models/target_group/TargetGroup');
const Template = require('../../../models/template/Template');
const User = require('../../../models/user/User');

module.exports = (req, res) => {
  const company_id = req.session.user.company._id;
  
  Question.findQuestionsForCompany(company_id, (err, questions) => {
    if (err) return res.redirect('/auth/login');

    Product.findProductsByCompanyId(company_id, (err, products) => {
      if (err) return res.redirect('/auth/login');

      Question.findUnusedTemplatesForCompany(company_id, (err, templates) => {
        if (err) return res.redirect('/auth/login');

        TargetGroup.findTargetGroupsByCompanyIdAndFormat(company_id, (err, target_groups) => {
          if (err) return res.redirect('/auth/login');

          Template.findTemplatesByFiltersAndSorted({
            language: req.session.user.company.preferred_language
          }, (err, filters) => {
            if (err) return res.redirect('/auth/login');

            Ad.findAdsByCompanyId(company_id, (err, ads) => {
              if (err) return res.redirect('/auth/login');

              User.findUsersByCompanyId(company_id, (err, team) => {
                if (err) return res.redirect('/auth/login');

                return res.render('index/index', {
                  page: 'index/index',
                  title: 'Dashboard',
                  includes: {
                    external: {
                      css: ['button', 'confirm', 'dashboard', 'form', 'input', 'fontawesome', 'general', 'text', 'page'],
                      js: ['confirm', 'dragAndDrop', 'duplicateElement', 'error', 'form', 'input', 'page', 'serverRequest']
                    }
                  },
                  pie_chart_colors: [
                    'rgba(92, 196, 110, 1)',
                    'rgba(45, 136, 196, 1)',
                    'rgba(237, 72, 80, 1)',
                    'rgba(254, 211, 85, 1)',
                    'rgba(188, 141, 167, 1)',
                    'rgba(254, 93, 38, 1)',
                    'rgba(35, 201, 255, 1)',
                    'rgba(255, 153, 20, 1)',
                    'rgba(94, 11, 21, 1)',
                    'rgba(5, 41, 158, 1)',
                    'rgba(242, 108, 167, 1)'
                  ],
                  user: req.session.user,
                  ads,
                  questions,
                  templates,
                  products,
                  target_groups,
                  team,
                  company: req.session.user.company
                });
              });
            });
          });
        });
      });
    });
  });
}
