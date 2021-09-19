const fetch = require('node-fetch');

module.exports = (body, callback) => {
  const ELASTIC_EMAIL_API_KEY = process.env.ELASTIC_EMAIL_API_KEY;

  if (!body || !body.template || !body.to) return callback('bad_request');

  if (body.template == 'confirmation_code') {
    if (!body.email || !body.code)
      return callback('bad_request');

    fetch(`https://api.elasticemail.com/v2/email/send?apiKey=${ELASTIC_EMAIL_API_KEY}&isTransactional=true&template=confirmation_code&merge_email=${body.email}&merge_code=${body.code}&to=${body.to.trim()}&charset=utf-8`, {
      method: 'POST'
    })
      .then(data => data.json())
      .then(res => callback(null, res))
      .catch(err => callback('database_error'));
  } else if (body.template == 'off_waitlist') {
    if (!body.email)
      return callback('bad_request');

    fetch(`https://api.elasticemail.com/v2/email/send?apiKey=${ELASTIC_EMAIL_API_KEY}&isTransactional=true&template=off_waitlist&merge_email=${body.email}&to=${body.to.trim()}&charset=utf-8`, {
      method: 'POST'
    })
      .then(data => data.json())
      .then(res => callback(null, res))
      .catch(err => callback('database_error'));
  } else {
    return callback('bad_request');
  }
};
