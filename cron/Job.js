const cron = require('node-cron');

const deleteOutdatedAnswers = require('./functions/deleteOutdatedAnswers');

const Job = {
  start: callback => {
    const job = cron.schedule('* * * * *', () => {
      deleteOutdatedAnswers();
    });

    setTimeout(() => {
      job.start();
      callback();
    }, 1000);
  }
}

module.exports = Job;
