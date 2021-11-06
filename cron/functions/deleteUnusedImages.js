const Image = require('../../models/image/Image');

module.exports = () => {
  Image.findExpiredImagesAndDelete(err => {
    if (err) return console.log('Error on Cron Job: ' + err);

    return null;
  });
}
