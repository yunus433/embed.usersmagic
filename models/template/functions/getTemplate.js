module.exports = (template, callback) => {
  if (!template || !template._id)
    return callback('document_not_found');

  if (template.subtype == 'yes_no')
    template.choices = ['yes', 'no'];

  if (template.subtype == 'scale' || template.subtype == 'number')
    template.choices = Array.from({ length: template.max_value - template.min_value + 1 }, (each, i) => (i + template.min_value).toString());

  return callback(null, {
    _id: template._id.toString(),
    timeout_duration_in_week: template.timeout_duration_in_week,
    timeout_duration_in_week_by_choices: template.timeout_duration_in_week_by_choices,
    order_number: template.order_number,
    is_default_template: template.is_default_template,
    language: template.language,
    name: template.name,
    text: template.text,
    type: template.type,
    subtype: template.subtype,
    choices: template.choices,
    min_value: template.min_value,
    max_value: template.max_value,
    labels: template.labels
  });
}
