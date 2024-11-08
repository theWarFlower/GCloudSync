const SPREADSHEET_ID = '1HBtEvBRURIQIoPegA6BNeTBrkJ88gvprEb0TUJWBV20';
/**
 * This function handles new calendar events by logging updates, checking for valid
 * calendar ID, retrieving events within a specific date range, and logging synchronization status.
 * @param {object} e The event object that contains information about the calendar event.
 * This function handles new calendar events.
 * @returns {void}
 * @throws Will throw an error if the event object is invalid.
 *
 */
function newCalendarEvent(e) {
  try {
    logUpdates('TRIGGER: ' + JSON.stringify(e));
    if (!e.calendarId) {
      throw new Error('Invalid event object: ' + JSON.stringify(e));
    }
    logSynchedEvents(e.calendarId, false);

  } catch (error) {
    logUpdates('Error handling new calendar event: ' + error.message);
    Logger.log('Error handling new calendar event: ' + error.message);
  }
}
/**
 * Helper function to get a new Date object relative to the current date.
 * @param {number} daysOffset The number of days in the future for the new date.
 * @param {number} hour The hour of the day for the new date, in the time zone
 *     of the script.
 * @return {Date} The new date.
 */
function getRelativeDate(daysOffset, hoursOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(date.getHours() + hoursOffset);
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
  let calendar;
  let calEvents;
  let pageToken;
  do {
    try {
      options.pageToken = pageToken;
      calendar = CalendarApp.getCalendarById(calendarId);
      logUpdates('SYNCHING: ' + calendar.getName());
      calEvents = Calendar.Events.list(calendarId, options);
      logUpdates('EVENTS:', +calEvents.items)
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
    if (calEvents.items && calEvents.items.length === 0) {
      logUpdates('No events found.');
      return;
    }
    for (const calEvent of calEvents.items) {
      if (calEvent.status === 'cancelled') {
        logUpdates('Event cancelled: ' + calEvent.id);
        return;
      }
      logUpdates('ADJUSTING EVENT: ' + calEvent.summary)
      let apiEvent = Calendar.Events.get(calendarId, calEvent.id)
      adjustEvent(calendarId, apiEvent);
    };
      pageToken = calEvents.nextPageToken;
  } while (pageToken);
  properties.setProperty('syncToken', events.nextSyncToken);
}

/**
 * This function adjusts the start and end time of the event by adding one hour.
 * @param {object} event - The event object to be adjusted.
 * @returns {void}
 * @throws Will throw an error if the event object is invalid.
 */
function adjustEvent(calendarId, apiEvent) {
  if (!apiEvent) {
    logUpdates('Event not found!');
    return;
  }
  
  if (apiEvent.isAllDayEvent) {
    logUpdates('Skipping all-day event: ' + apiEvent.summary);
    return;
  }

  let startTime = new Date(apiEvent.start.dateTime);
  let endTime = new Date(apiEvent.end.dateTime);
  console.log('Unmodified: ' + JSON.stringify(apiEvent))

  logUpdates('FOUND EVENT: ' + apiEvent.summary);
  logUpdates('OLD | START: ' + apiEvent.start.dateTime);

  startTime.setTime(startTime.getTime() + 3600000);
  endTime.setTime(endTime.getTime() + 3600000);
  apiEvent.start.dateTime = startTime.toISOString();
  apiEvent.end.dateTime = endTime.toISOString();

  console.log('Modified: ' + JSON.stringify(apiEvent))

  try {
    //event = Calendar.Events.update(
    //  apiEvent,
    //  calendarId,
    //  apiEvent.id,
    //  {},
    //  {'If-Match': apiEvent.etag}
    //);
    logUpdates('NEW | START: ' + apiEvent.start.dateTime);
    logUpdates('Event adjusted: ' + apiEvent.summary);
    logEvents(apiEvent);
    return;
  } catch (e) {
    console.log('Fetch threw an exception: ' + e);
    logUpdates('FAILED TO ADJUST EVENT: ' + e);
  }
}

/**
 *
 * @param {object} e - The event object that contains information about the calendar event.
 * This function logs the event details to a Google Sheet.
 * @returns {void}
 */
function logEvents(e) {
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events').appendRow([
      new Date(), e.calendarId, e.id, e.summary, e.start.dateTime, e.end.dateTime
    ]);
  } catch (error) {
    Logger.log('Error logging events:', error);
    logUpdates('Error logging events: ' + error.message);
  }
}
/**
 * Logs updates to a Google Sheet.
 *
 * @param {string} message
 */
function logUpdates(message) {
  try {
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Log').appendRow([new Date(), message]);
  } catch (error) {
    console.error('Error logging updates:', error);
  }
}