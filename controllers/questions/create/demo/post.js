const mongoose = require('mongoose');

module.exports = (req, res) => {
  const template = req.session.demo.templates.find(each => each._id == data.template_id);

  if (!template) {
    res.write(JSON.stringify({ success: false, error: 'bad_request' }));
    return res.end();
  }

  if (template.subtype == 'yes_no')
    template.choices = ['yes', 'no'];

  if (template.subtype == 'scale' || template.subtype == 'number')
    template.choices = Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString());


  const newQuestionData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    template_id: data.template_id,
    company_id: data.company_id,
    product_id: data.product_id,
    order_number: req.session.demo.questions.length,
    created_at: data.created_at,
    timeout_duration_in_week: template.timeout_duration_in_week,
    name: template.name,
    text: template.text,
    type: template.type,
    subtype: template.subtype,
    choices: template.choices,
    min_value: template.min_value,
    max_value: template.max_value,
    labels: template.labels
  };

  const newGraphData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    question_type: template.type,
    integration_path_id_list: [
      {
        signature: '6186b5ae4c86d13d62a88a90kaydol_sayfası',
        company_id: '6186b5ae4c86d13d62a88a90',
        type: 'page',
        name: 'Kaydol Sayfası',
        path: '/register',
        product_id: null
      }
    ],
    title: 'Cinsiyet',
    description: 'Cinsiyetiniz nedir?',
    type: 'pie_chart',
    data: [
      {
        name: 'Erkek',
        value: 21282
      },
      {
        name: 'Kadın',
        value: 9121
      }
    ],
    created_at: '20.04.2022',
    is_active: true,
    total: 30403
  };

  req.session.demo.questions.push(newQuestionData);
  if (template.type != 'product')
    req.session.demo.templates = req.session.demo.templates.filter(each => each._id != template._id);
  req.session.demo.graphs.push(newGraphData);

  res.write(JSON.stringify({ success: true, id: newQuestionData._id }));
  return res.end();
}
