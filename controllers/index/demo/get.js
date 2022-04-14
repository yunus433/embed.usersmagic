module.exports = (req, res) => {
  const demo = req.session.demo;

  return res.render('index/index', {
    page: 'index/index',
    title: 'Demo',
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
    is_demo: true,
    ads: demo.ads,
    questions: demo.questions,
    templates: demo.templates,
    products: demo.products,
    target_groups: demo.target_groups,
    company: demo.company,
    user: demo.user,
    team: demo.team
  });
}
