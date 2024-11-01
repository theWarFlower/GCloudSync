/**
 * The main function deletes all triggers in the current project, sets up new triggers, and logs
 * updates accordingly.
 */
function main() {
  try {
    // Deletes all triggers in the current project.
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
      logUpdates('Deleted trigger: ' + trigger.getHandlerFunction() + ' for calendar: ' + trigger.getTriggerSourceId());
    });
    setupTriggers();
    logUpdates('Triggers Successfully Deployed.');
  } catch (error) {
    console.error('Error in main function:', error.message);
    logUpdates('Error in main function: ' + error.message);
  }
}

/**
 * Get all calendars that start with "iP".
 * @returns {string[]} An array of calendar IDs that start with "iP".
 * @throws Will throw an error if the calendar fetching fails.
 */
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
/**
 * Sets up triggers for each calendar.
  * @returns {void}
  * @throws Will throw an error if the trigger setup fails.
 */
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