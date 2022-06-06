const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_MONDAY = 1;

module.exports = (week_addition, callback) => {
  if (isNaN(week_addition) || !Number.isInteger(week_addition))
    return callback('bad_request');

  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  return callback(null, today.getTime() - (today.getDay() - DAY_MONDAY) * DAY_IN_MS + week_addition * WEEK_IN_MS);
}
