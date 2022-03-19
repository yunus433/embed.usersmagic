// Do not work correctly yet

const async = require('async');
const json2csv = require('json-2-csv');

const TargetGroup = require('../../../models/target_group/TargetGroup');

module.exports = (req, res) => {
  TargetGroup.findTargetGroupById(req.query.id, (err, target_group) => {
    if (err) return res.redirecy('/');

    TargetGroup.findTargetGroupByIdAndGetHashedPersonEmailListForFacebook({
      company_id: req.session.user.company._id,
      target_group_id: req.query.id
    }, (err, files) => {
      if (err) return res.redirect('/');

      json2csv.json2csv(files[0], (err, csv) => {
        if (err) return res.redirect('/');

        return res.attachment(`${target_group.name} (Usersmagic Facebook Email List - 1).csv`).send(csv);
      });
  
      // async.timesSeries(
      //   files.length,
      //   (time, next) => json2csv.json2csv(files[time], (err, csv) => {
      //     if (err) return res.redirect('/');
      
      //     res.attachment(`${target_group.name} (Usersmagic Facebook Email List - ${time+1}).csv`).send(csv);
      //   }),
      //   err => {
      //     if (err) return res.redirect('/');

      //     return res.end();
      //   }
      // );
    });
  });
}
