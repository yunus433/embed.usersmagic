module.exports = (product, callback) => {
  if (!product || !product._id)
    return callback('document_not_found');

  return callback(null, {
    _id: product._id.toString(),
    company_id: product.company_id.toString(),
    name: product.name,
    link: product.link
  });
}
