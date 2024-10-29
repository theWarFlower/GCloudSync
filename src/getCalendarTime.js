/* Sandy Good's answer to this SO question:
 *
 *   http://stackoverflow.com/questions/15645343/how-to-use-timezone-of-calendar-to-set-timezone-for-date-object
 *
 * @param {Date} scriptDateTime
 * @param {Calendar} calendar
 *
 * @return {Date} calendarDateTime
 */

function getCalendarDateTime (scriptDateTime, calendar) {

  Logger.log('scriptDateTime: ' + scriptDateTime)

  var calendarTimeZoneString = calendar.getTimeZone() 
  var calendarTimeZone = Utilities.formatDate(scriptDateTime, calendarTimeZoneString, 'Z')
  var calendarTz = Number(calendarTimeZone.slice(0,3)) 
  Logger.log('calendarTimeZone: %s (%s)', calendarTimeZoneString, calendarTz)

  var scriptTimeZoneString = Session.getScriptTimeZone()
  var scriptTimeZone = Utilities.formatDate(scriptDateTime, scriptTimeZoneString, 'Z')
  var sessionTz = Number(scriptTimeZone.slice(0,3))
  Logger.log('scriptTimeZone: %s (%s)', scriptTimeZoneString, sessionTz)

  // If both time zones are the same sign, get the difference between the
  // two.  E.g. -4 and -2.  Difference is 2
  // 
  // If each time zone is a different sign, add the absolute values together.
  // -4 and +1 should be 5

  var timeZoneDiff

  if (calendarTz < 0 && sessionTz > 0 || calendarTz > 0 && sessionTz < 0) {

    timeZoneDiff = Math.abs(Math.abs(calendarTz) + Math.abs(sessionTz))

  } else {

    timeZoneDiff = Math.abs(Math.abs(calendarTz) - Math.abs(sessionTz)) 
  }

  Logger.log('timeZoneDiff: ' + timeZoneDiff)

  var scriptHour = scriptDateTime.getHours()
  var calendarHour = scriptHour + timeZoneDiff

  var calendarDateTime = new Date(
    scriptDateTime.getYear(), 
    scriptDateTime.getMonth(),
    scriptDateTime.getDate(),
    calendarHour,
    scriptDateTime.getMinutes())

  Logger.log('calendarDateTime: ' + calendarDateTime)

  return calendarDateTime  
}

// Script is PST (GMT-8) and calendar is GMT

function test_getCalendarDateTime() {
  var calendar = CalendarApp.getDefaultCalendar()
  var scriptDateTime = new Date(2024, 10, 30, 12, 0) // 2017-01-30 12:00 PST
  var calendarDateTime = getCalendarDateTime(scriptDateTime, calendar) // 2017-01-30 20:00 PST
}