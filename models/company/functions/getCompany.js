module.exports = (company, callback) => {
  if (!company || !company._id)
    return callback('document_not_found');

  return callback(null, {
    _id: company._id.toString(),
    name: company.name,
    country: company.country,
    is_on_waitlist: company.is_on_waitlist,
    waiting_domain: company.waiting_domain ? 'https://' + company.waiting_domain : null,
    domain: company.domain ? 'https://' + company.domain : null,
    integration_routes: company.integration_routes || [],
    preferred_language: company.preferred_language,
    preferred_color: company.preferred_color
  });
}
