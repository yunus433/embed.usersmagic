const Product = require('../../product/Product');
const Template = require('../../template/Template');

module.exports = (question, callback) => {
  if (!question || !question._id)
    return callback('document_not_found');

  Template.findTemplateByIdAndFormat(question.template_id, (err, template) => {
    if (err) return callback(err);

    if (template.type != 'product')
      return callback(null, {
        _id: question._id.toString(),
        is_active: question.is_active,
        timeout_duration_in_week: template.timeout_duration_in_week,
        order_number: template.order_number,
        name: template.name,
        text: template.text,
        type: template.type,
        subtype: template.subtype,
        choices: template.choices,
        min_value: template.min_value,
        max_value: template.max_value,
        labels: template.labels
      });

    Product.findProductById(question.product_id, (err, product) => {
      if (err) return callback(err);

      return callback(null, {
        _id: question._id.toString(),
        is_active: question.is_active,
        timeout_duration_in_week: template.timeout_duration_in_week,
        order_number: template.order_number,
        name: template.name.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
        text: template.text.split('{').map(each => each.includes('}') ? product[each.split('}')[0]] + each.split('}')[1] : each).join(''),
        product_link: product.link,
        type: template.type,
        subtype: template.subtype,
        choices: template.choices,
        min_value: template.min_value,
        max_value: template.max_value,
        labels: template.labels
      });
    });
  });
}
