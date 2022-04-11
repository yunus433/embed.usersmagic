const mongoose = require('mongoose');

module.exports = (req, res) => {
  const newProductData = {
    _id: (new mongoose.Types.ObjectId()).toString(),
    company_id: req.session.demo.company._id,
    name: req.body.name,
    link: req.body.link
  };

  req.session.demo.products.push(newProductData);

  res.write(JSON.stringify({ id: newProductData._id, success: true }));
  return res.end();
}
