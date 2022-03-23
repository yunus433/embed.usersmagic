const AdData = require('../../ad_data/AdData');
const TargetGroup = require('../../target_group/TargetGroup');

module.exports = (ad, callback) => {
  if (!ad || !ad._id)
    return callback('document_not_found');

  TargetGroup.findTargetGroupByIdAndFormat(ad.target_group_id, (err, target_group) => {
    if (err) return callback(err);

    AdData.findAdDataByAdIdAndGetAdStatistics(ad._id, (err, statistics) => {
      if (err) return callback(err);

      return callback(null, {
        _id: ad._id.toString(),
        order_number: ad.order_number,
        name: ad.name,
        title: ad.title,
        text: ad.text,
        button_text: ad.button_text,
        button_url: ad.button_url,
        image_url: ad.image_url,
        target_group: target_group,
        is_active: ad.is_active,
        created_at: ad.created_at,
        statistics
      });
    });
  });
};
