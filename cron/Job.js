const cron = require('node-cron');

const deleteOutdatedAnswers = require('./functions/deleteOutdatedAnswers');
const deleteUnusedImages = require('./functions/deleteUnusedImages');

const Job = {
  start: callback => {
    const job = cron.schedule('* * * * *', () => {
      deleteOutdatedAnswers();
      deleteUnusedImages();
    });

    setTimeout(() => {
      job.start();
      callback();
    }, 1000);
  }
}

module.exports = Job;
