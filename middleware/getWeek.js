const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_MONDAY = 1;

function getUnixTimeForThisMonday() {
  let today = new Date();
  today.setHours(0, 0, 0);

  let day_today = today.getDay() || 7;
  let ms_since_monday = ((day_today - DAY_MONDAY) * DAY_IN_MS);
  let monday = today.getTime() - ms_since_monday;

  return monday;
}

module.exports = (week_addition, callback) => {
  if (isNaN(week_addition) || !Number.isInteger(week_addition))
    return callback('bad_request');

  return callback(null, getUnixTimeForThisMonday() + week_addition * WEEK_IN_MS);
}
