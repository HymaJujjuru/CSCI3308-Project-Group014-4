let EVENT_MODAL;
function initializeEventModal() {
  // @TODO: Create a modal using JS. The id will be `create-modal`:
  // Reference: https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
  EVENT_MODAL = new bootstrap.Modal(document.getElementById('create-modal'));
}

// *****************************************************
// <-- GAPI functions/integration -->
// *****************************************************
let tokenClient;
let gapiInited = false;
let gisInited = false;
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}
async function initializeGapiClient() {
  await gapi.client.init({
      apiKey: 'AIzaSyAVqfakhPXEU378QnEZocyrisCZ3ZhNHO4',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  });
  gapiInited = true;
  checkTokenOnClientLoad();
}
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '69914372338-1f5jkuep8a7bi9jstknohbjhe1if7pio.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/calendar',
      callback: tokenResponseHandler,
  });
  gisInited = true;
  maybeEnableButtons();
}
function checkTokenOnClientLoad() {
  const token = sessionStorage.getItem('gapi_token');
  if (token) {
      gapi.client.setToken({access_token: token});
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').style.visibility = 'hidden';
      loadUserCalendar();
  } else {
      maybeEnableButtons();
  }
}
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
      document.getElementById('authorize_button').style.visibility = 'visible';
      document.getElementById('signout_button').style.visibility = 'hidden';
  }
}
function handleAuthClick() {
  tokenClient.callback = tokenResponseHandler;
  tokenClient.requestAccessToken({prompt: 'consent'});
}
function tokenResponseHandler(resp) {
  sessionStorage.setItem('gapi_token', resp.access_token);
  gapi.client.setToken({access_token: resp.access_token});
  document.getElementById('signout_button').style.visibility = 'visible';
  document.getElementById('authorize_button').style.visibility = 'hidden';
  loadUserCalendar();
}
function handleSignoutClick() {
  const token = sessionStorage.getItem('gapi_token');
  if (token) {
      google.accounts.oauth2.revoke(token);
      gapi.client.setToken('');
      sessionStorage.removeItem('gapi_token');
      document.getElementById('signout_button').style.visibility = 'hidden';
      document.getElementById('authorize_button').style.visibility = 'visible';
  }
}
async function loadUserCalendar() {
  try {
      const response = await gapi.client.calendar.calendars.get({ 'calendarId': 'primary' });
      const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(response.result.id)}&ctz=America/Denver`;
      document.getElementById('user-calendar-iframe').src = calendarUrl;
  } catch (error) {
  }
}
function addEventToCalendar(courseNo, dateString, startTime, endTime, location, reoccur) {
  const date = new Date(dateString);
  const formattedDate = date.toISOString().split('T')[0];
  const adjustTime = (time, isStart) => {
      if (time === '24:00:00') {
          return isStart ? '00:00:00' : '23:59:59';
      }
      return time;
  };

  const formattedStartTime = adjustTime(startTime, true);
  const formattedEndTime = adjustTime(endTime, false);

  let startDateTime = new Date(`${formattedDate}T${formattedStartTime}`);
  let endDateTime = new Date(`${formattedDate}T${formattedEndTime}`);
  if (formattedEndTime === '23:59:59') {
      endDateTime.setMinutes(endDateTime.getMinutes() + 1);
  }

  const event = {
      'summary': `Study Session for CSCI ${courseNo}`,
      'location': location,
      'start': {
          'dateTime': startDateTime.toISOString(),
          'timeZone': 'America/Denver'
      },
      'end': {
          'dateTime': endDateTime.toISOString(),
          'timeZone': 'America/Denver'
      },
      'reminders': {
          'useDefault': false,
          'overrides': [
              {'method': 'email', 'minutes': 1440},
              {'method': 'popup', 'minutes': 30}
          ]
      }
  };

  if (reoccur) {
    event['recurrence'] = ['RRULE:FREQ=WEEKLY;COUNT=4'];
}

  const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
  });

  request.execute(event => {
      alert('Event created: ' + event.htmlLink);
  });
}