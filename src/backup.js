const SPREADSHEET_ID = '1HBtEvBRURIQIoPegA6BNeTBrkJ88gvprEb0TUJWBV20';

function main() {
  try {
    // Deletes all triggers in the current project.
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
      logUpdates('Deleted trigger: ' + trigger.getHandlerFunction() + ' for calendar: ' + trigger.getTriggerSourceId());
    });
    setupTriggers();
    logUpdates('Main function executed successfully.');
  } catch (error) {
    console.error('Error in main function:', error);
    logUpdates('Error in main function: ' + error.message);
  }
}

function getCalendars() {
  try {
    const calendarList = CalendarApp.getAllCalendars();
    const filteredCalendars = calendarList.filter(cal => cal.getName().startsWith("iP"));
    const calendarIDs = filteredCalendars.map(cal => cal.getId());
    logUpdates('Fetched calendars: ' + JSON.stringify(calendarIDs));
    return calendarIDs;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    logUpdates('Error fetching calendars: ' + error.message);
    return [];
  }
}

function setupTriggers() {
  try {
    const calendarIDs = getCalendars();
    calendarIDs.forEach(calendarID => {
      ScriptApp.newTrigger('newCalendarEvent')
        .forUserCalendar(calendarID)
        .onEventUpdated()
        .create();
      logUpdates('Trigger set up for calendar: ' + calendarID);
    });
  } catch (error) {
    console.error('Error setting up triggers:', error);
    logUpdates('Error setting up triggers: ' + error.message);
  }
}

function newCalendarEvent(e) {
  try {
    logUpdates('TRIGGER: ' + JSON.stringify(e));
    const calendarId = e.calendarId;
    if (!calendarId) {
      throw new Error('Invalid event object: ' + JSON.stringify(e));
    }

    const calendar = CalendarApp.getCalendarById(calendarId);
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    const events = calendar.getEvents(now, oneMonthFromNow);

    if (events && events.length > 0) {
      logUpdates('SYNCING: ' + calendar.getName());
      events.forEach(event => {
        adjustEvent(event);
        logEvents(event);
      });
    } else {
      logUpdates('No events found in calendar: ' + calendar.getName());
    }
  } catch (error) {
    logUpdates('Error handling new calendar event: ' + error.message);
    Logger.log('Error handling new calendar event:', error);
  }
}

/**
 * This function adjusts the start and end time of the event by adding one hour.
 * @param {object} event - The event object to be adjusted.
 * @returns {void}
 * @throws Will throw an error if the event object is invalid.
 */
function adjustEvent(event) {
  const timeZone = "America/Chicago";
  let startTime, endTime;

  if (event.start.dateTime) {
    startTime = new Date(event.start.dateTime);
  } else if (event.start.date) {
    startTime = new Date(event.start.date);
    startTime.setHours(0, 0, 0, 0); // Set to start of the day for all-day events
  } else {
    throw new Error('Invalid event object: missing start time');
  }

  if (event.end.dateTime) {
    endTime = new Date(event.end.dateTime);
  } else if (event.end.date) {
    endTime = new Date(event.end.date);
    endTime.setHours(23, 59, 59, 999); // Set to end of the day for all-day events
  } else {
    throw new Error('Invalid event object: missing end time');
  }

  if (event.isAllDayEvent) {
    logUpdates('Skipping all-day event: ' + event.id);
    return;
  }

  startTime.setUTCHours(startTime.getUTCHours() + 1);
  endTime.setUTCHours(endTime.getUTCHours() + 1);

  logUpdates('FOUND EVENT: ' + event.summary);
  logUpdates('OLD | START: ' + (event.start.dateTime || event.start.date) + ' END: ' + (event.end.dateTime || event.end.date));

  event.start.dateTime = startTime.toISOString();
  event.end.dateTime = endTime.toISOString();

  logUpdates('NEW | START: ' + event.start.dateTime + ' END: ' + event.end.dateTime);
  logUpdates('Event adjusted: ' + event.id);
}

function logEvents(e) {
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events').appendRow([
      new Date(), e.getId(), e.getTitle(), e.getStartTime(), e.getEndTime()
    ]);
  } catch (error) {
    Logger.log('Error logging events:', error);
    logUpdates('Error logging events: ' + error.message);
  }
}

function logUpdates(message) {
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Log').appendRow([new Date(), message]);
  } catch (error) {
    console.error('Error logging updates:', error);
  }
}

main();