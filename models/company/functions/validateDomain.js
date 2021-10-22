const validator = require('validator');

module.exports = (_domain, callback) => {
  let domain = _domain;
  
  if (!domain || typeof domain != 'string' || !validator.isURL(domain))
    return callback('bad_request');

  if (!domain.includes('https://'))
    return callback('bad_request');

  domain = domain.replace('https://', '');
  const dot_count = domain.split('.').length - 1;
  domain = domain.split('.')[dot_count-1] + '.' + (domain.split('.')[dot_count].split('/')[0]);

  return callback(null, domain);
}
