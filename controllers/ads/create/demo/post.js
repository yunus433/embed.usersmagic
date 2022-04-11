const mongoose = require('mongoose');

module.exports = (req, res) => {
  const newAdData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    company_id: req.session.demo.company._id,
    order_number: req.session.demo.ads.length,
    name: req.body.name.trim(),
    title: req.body.title.trim(),
    text: req.body.text.trim(),
    button_text: req.body.button_text.trim(),
    button_url: req.body.button_url.trim(),
    image_url: req.body.image_url,
    target_group_id: data.target_group_id,
    integration_path_id_list: req.body.integration_path_id_list,
    created_at: req.body.created_at.trim()
  };

  req.session.demo.ads.push(newAdData);

  res.write(JSON.stringify({ success: true, id: newAdData._id }));
  return res.end();
}
