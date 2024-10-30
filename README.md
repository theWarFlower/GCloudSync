# Google Apps Script Calendar Event Monitor

This project is a Google Apps Script that monitors multiple Google Calendars for new or modified events and makes changes to each event. It uses modern JavaScript features and is developed using Visual Studio Code.

## Features

- Monitors multiple Google Calendars for new or updated events.
- Automatically updates event titles when changes are detected.
- Logs event updates and changes to a Google Sheet.

## Project Structure

```
.
├── .clasp.json
├── .claspignore
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .vscode/
│   └── settings.json
├── appsscript.json
├── babel.config.js
├── docs/
│   ├── _config.yml
│   └── index.md
├── functions/
│   ├── currency.js
│   └── double.js
├── FUNCTIONS.md
├── gscripts.code-workspace
├── images/
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── scopes.md
├── src/
│   ├── appsscript.json
│   ├── Calendar.gs.js
│   └── getCalendarTime.js
├── test/
│   └── server/
│       └── utils.test.js
├── TOOLS.md
└── webpack.config.js
```

## Setup

### Prerequisites

- Node.js (>= 12)
- npm or pnpm
- Google Apps Script CLI (`clasp`)

### Installation


## Usage

### Setting Up Triggers

The `setupTriggers` function sets up triggers for all calendars returned by the `getCalendars` function. This function is called in the `main` function.

### Handling Event Changes

The `handleEventChange` function is triggered whenever an event is created or updated. It updates the event title and logs the changes.

### Logging

Event updates and changes are logged to a Google Sheet specified in the `logEvents` and `logUpdates` functions.

## Configuration

### appsscript.json

The `appsscript.json` file configures the Google Apps Script project. It includes the time zone, dependencies, and runtime version.

```json
{
  "timeZone": "America/Chicago",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Calendar",
        "version": "v3",
        "serviceId": "calendar"
      },
      {
        "userSymbol": "Sheets",
        "version": "v4",
        "serviceId": "sheets"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Development

### Watch for Changes

```sh
npm run watch
```

### Run Tests

```sh
npm run test
```

### Build and Deploy

```sh
npm run deploy
```

## Tools

- **VSCode Extension:** [Google Apps Script Extensions Pack](https://marketplace.visualstudio.com/items?itemName=labnol.google-apps-script)
- **Babel:** Transpile ES6+ code to ES5.
- **Webpack:** Bundle JavaScript modules.
- **ESLint:** Lint JavaScript code.
- **Google CLASP:** Command-line utility for Google Apps Script.
- **Prettier:** Code formatter.

## Acknowledgments

- [Amit Agarwal](https://www.labnol.org) - [Digital Inspiration](https://digitalinspiration.com/)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Sheets API](https://developers.google.com/sheets)
```
