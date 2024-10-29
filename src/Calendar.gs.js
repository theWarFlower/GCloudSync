function getCalendars() {
  const calendarList = CalendarApp.getAllCalendars();
  const filteredCalendars = calendarList.filter(function(cal) {
    return cal.getName().startsWith("iP");
  });
  return filteredCalendars.map(function(cal) {
    return cal.getId()
  });
}

function setupTriggers() {
  const calendarIDs = getCalendars();
  calendarIDs.forEach(function(calendarID) {
    ScriptApp.newTrigger('newCalendarEvent')
      .forUserCalendar(calendarID)
      .onEventUpdated()
      .create();
});
}

function newCalendarEvent(e) {
  logUpdates('TRIGGER: ' + e.calendarId + e.eventId);
  const calendar = CalendarApp.getCalendarById(e.calendarId);
  const event = calendar.getEventById(e.eventId);

  if (event) {
    // event.setTitle('Updated: ' + event.getTitle());
    logUpdates('UPDATED: ' + event.getTitle());
  } else {
    logUpdates('Event not found: ' + e.eventId);
  }
}
function listEvents(calendarIDs) {
  var allEvents = [];

  calendarIDs.forEach(function(calendarID) {
    var cal = CalendarApp.getCalendarById(calendarID)
    var events = cal.getEvents(new Date(), new Date('2100-01-01'));
    if (events.length > 0) {
      logUpdates('Events from calendar: ' + cal.getName());
      events.forEach(function(event) {
        logEvents(event);
        allEvents.push({
          id: event.getId(),
          title: event.getTitle(),
          start: event.getStartTime(),
          end: event.getEndTime()
      });
      });
    } else {
      logUpdates('No upcoming events found in calendar: ' + cal.getName());
    }
  });
  return allEvents;
}

function logEvents(e) {
  SpeadsheetApp.openById('1HBtEvBRURIQIoPegA6BNeTBrkJ88gvprEb0TUJWBV20').getSheetByName('Events').appendRow([new Date(), e.calendarId, e.eventId, e.title, e.start, e.end]);
}

function logUpdates(message) {
  SpreadsheetApp.openById('1HBtEvBRURIQIoPegA6BNeTBrkJ88gvprEb0TUJWBV20').getSheetByName('Events').appendRow([new Date(), message]);
}

function main() {
  setupTriggers();
  logUpdates('Triggers set up for calendars: ' + calendarIDs.join(', '));
}

main();