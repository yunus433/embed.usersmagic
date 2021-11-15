const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({	
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,	
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY	
});

module.exports = async (file_name, callback) => {
  const file_content = fs.readFileSync('./public/res/uploads/' + file_name);	

  const params = {	
    Bucket: process.env.AWS_BUCKET_NAME,	
    Key: file_name,	
    Body: file_content,	
    ContentType: 'image/jpg',	
    ACL: 'public-read'	
  };
  
  s3.upload(params, (err, data) => {
    if (err) return callback(err);	
  
    fs.unlink('./public/res/uploads/' + file_name, err => {	
      return callback(err, data.Location);	
    });
  });
}
