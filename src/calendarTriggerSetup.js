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
    const events = calendar.getEvents(new Date(), getRelativeDate(60,0)); 

    if (events && events.length > 0) {
      // event.setTitle('Updated: ' + event.getTitle());
      logUpdates('SYNCHING: ' + calendar.getName());
      logSynchedEvents(calendarId, false);
    } else {
      logUpdates('Events not found: ' + calendar.getName());
    }
  } catch (error) {
    logUpdates('Error handling new calendar event: ' + error.message);
    Logger.log('Error handling new calendar event:', error);
  }
}
/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} daysOffset The number of days in the future for the new date.
 * @param {number} hour The hour of the day for the new date, in the time zone
 *     of the script.
 * @return {Date} The new date.
 */
function getRelativeDate(daysOffset, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}


/**
 * Retrieve and log events from the given calendar that have been modified
 * since the last sync. If the sync token is missing or invalid, log all
 * events from up to one week old (a full sync).
 *
 * @param {string} calendarId The ID of the calender to retrieve events from.
 * @param {boolean} fullSync If true, throw out any existing sync token and
 *        perform a full sync; if false, use the existing sync token if possible.
 */
function logSynchedEvents(calendarId, fullSync) {
  const properties = PropertiesService.getScriptProperties();
  const options = {
    maxResults: 100
  };
  const syncToken = properties.getProperty('syncToken');
  if (syncToken && !fullSync) {
    options.syncToken = syncToken;
  } else {
    options.timeMin = getRelativeDate(-7, 0).toISOString();
  }
  let events;
  let pageToken;
  do {
    try {
      options.pageToken = pageToken;
      events = Calendar.Events.list(calendarId, options);
    } catch (e) { 
      // Check to see if the sunc token was invalidated by the server
      // If so, reset the sync token and perform a full sync
      if (e.code === 410) {
        properties.deleteProperty('syncToken');
        logUpdates('Sync token invalidated, performing full sync.');
        logSynchedEvents(calendarId, true);
        return;
      }
      throw new Error('Error retrieving events: ' + e.message);
    }
    if (events.items && events.items.length === 0) {
      logUpdates('No events found.');
      return;
    }
    for (const event of events.items) {
      adjustEvent(event);
      logEvents(event);
    };
      pageToken = events.nextPageToken;
  } while (pageToken);
  properties.setProperty('syncToken', events.nextSyncToken);
}

function adjustEvent(event) {
  const startTime = new Date(event.start.dateTime || event.start.date);
  const endTime = new Date(event.end.dateTime || event.end.date);

  if (event.isAllDayEvent) {
    logUpdates('Skipping all-day event: ' + event.id);
    return;
  }

  startTime.setHours(startTime.getHours() + 1);
  endTime.setHours(endTime.getHours() + 1);
  
  logUpdates('Adjusted event: ' + event.id);
  logUpdates('OLD START: ' + event.start.dateTime + ' NEW START: ' + startTime.toISOString());
  // event.start.dateTime = startTime.toISOString();
  // event.end.dateTime = endTime.toISOString();

}

function logEvents(e) {
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events').appendRow([
      new Date(), e.calendarId
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