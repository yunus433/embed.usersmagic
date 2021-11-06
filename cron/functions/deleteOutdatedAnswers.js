const Answer = require('../../models/answer/Answer');

module.exports = () => {
  Answer.deleteOutdatedAnswers(err => {
    if (err) return console.log('Error on Cron Job: ' + err);

    return null;
  });
}
