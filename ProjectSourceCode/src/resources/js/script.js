const CALENDAR_EVENTS = [
  {
    name: 'Hyma',
    weekday: 'wednesday',
    date: '04/04/2024',
    start_time: '10:00 am',
    end_time: '12:00 pm',
    location: 'EC'
  },
];

const CALENDAR_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

let EVENT_MODAL;

/********************** PART B: 6.1: CREATE CALENDAR *************************/

function createBootstrapCard(day) {
  // @TODO: Use `document.createElement()` function to create a `div`
  var card = document.createElement('div');
  // Let's add some bootstrap classes to the div to upgrade its appearance
  // This is the equivalent of <div class="col-sm m-1 bg-white rounded px-1 px-md-2"> in HTML
  card.className = 'col-sm m-1 bg-white rounded px-1 px-md-2';

  // This the equivalent of <div id="monday"> in HTML
  card.id = day.toLowerCase();
  return card;
}

function createTitle(day) {
  // Create weekday as the title.
  // @TODO: Use `document.createElement()` function to create a `div` for title
  const title = document.createElement('div');
  title.className = 'h6 text-center position-relative py-2';
  title.innerHTML = day;

  return title;
}

function createEventIcon(card) {
  // @TODO: Use `document.createElement()` function to add a "create an event" icon button to the card
  const icon = document.createElement('i');
  icon.className =
    'bi bi-calendar-plus btn position-absolute translate-middle start-100 rounded p-0 btn-link';

  // adding an event listener to the click event of the icon to open the modal
  // the below line of code would be the equivalent of:
  // <i onclick="openEventModal({day: 'monday'})"> in HTML.
  icon.setAttribute('onclick', `openEventModal({day: ${card.id}})`);
  return icon;
}

function createEventDiv() {
  //  @TODO: Use `document.createElement()` function to add one more div to the weekday card, which will be populated with events later.
  const eventsDiv = document.createElement('div');
  // We are adding a class for this container to able to call it when we're populating the days
  // with the events
  eventsDiv.classList.add('event-container');

  return eventsDiv;
}

/* The function initializeCalendar() initializes the Calendar for your events and it gets called `onload` of your page.
We will complete the TODOs to render the Calendar in the next few steps. */
function initializeCalendar() {
  // You will be implementing this function in section 2: Create Modal
  initializeEventModal();
  // @TODO: Get the div of the calendar which we created using its id. Either use document.getElementById() or document.querySelector()
  const calendarElement = document.getElementById('calendar');
  // Iterating over each CALENDAR_DAYS
  CALENDAR_DAYS.forEach(day => {
    // @TODO: Create a bootstrap card for each weekday. Uncomment the below line and call createBootstrapCard(day) function.
    var card = createBootstrapCard(day);
    // @TODO: Add card to the calendarElement. Use appendChild()
    calendarElement.appendChild(card);
    // @TODO: Uncomment the below line and call createTitle(day) function.
    var title = createTitle(day);
    // @TODO: Add title to the card. Use appendChild()
    card.appendChild(title);
    // @TODO: Uncomment the below line and call createEventIcon(card) function.
    var icon = createEventIcon(card);
    // @TODO: Add icon to the title. Use appendChild()
    title.appendChild(icon);
    // @TODO: Uncomment the below line and and call createEventDiv() function.
    var eventsDiv = createEventDiv();
    // @TODO: Add eventsDiv to the card. Use appendChild()
    card.appendChild(eventsDiv);
  });

  // @TODO: Uncomment this after you implement the updateDOM() function
  updateDOM();
}
// end of initializeCalendar()

/********************** PART B: 6.2: CREATE MODAL ****************************/

function initializeEventModal() {
  // @TODO: Create a modal using JS. The id will be `create-modal`:
  // Reference: https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
  EVENT_MODAL = new bootstrap.Modal(document.getElementById('create-modal'));
}

function updateEventFromModal(id) {
  // @TODO: Pick the modal field values using document.querySelecter(<>).value,
  // and assign it to each field in CALENDAR_EVENTS.
  EVENTS[id] = {
    name: document.querySelector("#event_name").value,
    weekday: document.querySelector("#study_weekday").value,
    date: document.querySelector("#study_day").value,
    start_time: document.querySelector("#study_time1").value,
    end_time: document.querySelector("#study_time2").value,
    location: document.querySelector("#study_location").value
  };

  // Update the dom to display the newly created event and hide the event modal
  //updateDOM();
  EVENT_MODAL.hide();
}

function openEventModal(id) { // openEventModal({ id, date })
  // Since we will be reusing the same modal for both creating and updating events,
  // we're creating variables to reference the title of the modal and the submit button
  // in javascript so we can update the text suitably
  const submit_button = document.querySelector("#submit_button");
  const modal_title = document.querySelector(".modal-title");
  // Check if the event exists in the EVENTS by using `id`
  let event = EVENTS[id];
  // If event is undefined, i.e it does not exist in the EVENTS, then we create a new event.
  // Else, we load the current event into the modal.
  if (!event) {
    event = {
      name: "",
      weekday: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
    };
    // @TODO: Update the innerHTML for modalTitle and submitButton
    // Replace <> with the correct attribute
    modal_title.innerHTML = "Create Event";
    submit_button.innerHTML = "Create Event";
    // Allocate a new event id. Note that nothing is inserted into the CALENDAR_EVENTS yet.
    // @TODO: Set the id to be the length of the CALENDAR_EVENTS because we are adding a new element
    id = EVENTS.length;
  } else {
    // We will default to "Update Event" as the text for the title and the submit button
    modal_title.innerHTML = "Update Event";
    submit_button.innerHTML = "Update Event";
  }
  // Once the event is fetched/created, populate the modal.
  // Use document.querySelector('<>').value to get the form elements. Replace <>
  // Hint: If it is a new event, the fields in the modal will be empty.
  document.querySelector("#event_name").value = event.name;
  // @TODO: Update remaining form fields of the modal with suitable values from the event.
  document.querySelector("#study_weekday").value = event.weekday;
  document.querySelector("#study_day").value = event.date;
  document.querySelector("#study_time1").value = event.start_time;
  document.querySelector("#study_time2").value = event.end_time;
  document.querySelector("#study_location").value = event.location;


  // Set the "action" event for the form to call the updateEventFromModal
  // when the form is submitted by clicking on the "Creat/Update Event" button
  const form = document.querySelector("#create-modal form");
  form.setAttribute("action", `javascript:updateEventFromModal(${id})`);
  if (!EVENT_MODAL) {
    EVENT_MODAL = new bootstrap.Modal(document.getElementById('create-modal'));
  }
  EVENT_MODAL.show();
}


// function updateLocationOptions(modality_value) {
//   // @TODO: get the "Location" and "Remote URL" HTML elements from the modal.
//   // Use document.querySelector() or document.getElementById().
//   const location = document.getElementById("event_location");//get the "Location" field

//   // @TODO: Depending on the "value" change the visibility style of these fields on the modal.
//   // Use conditional statements.
//   if (modality_value == "in-person") {
//     location.removeAttribute("hidden");
//     attendees.removeAttribute("hidden");
//     remoteUrl.setAttribute("hidden", "hidden");
//   }
//   else if (modality_value == "remote") {
//     remoteUrl.removeAttribute("hidden");
//     attendees.removeAttribute("hidden");
//     location.setAttribute("hidden", "hidden");
//   }
// }

/********************** PART B: 6.3: UPDATE DOM ******************************/

function createEventElement(id) {
  // @TODO: create a new div element. Use document.createElement().
  var eventElement = document.createElement('div');
  // Adding classes to the <div> element.
  eventElement.classList = "event row border rounded m-1 py-1";
  // @TODO: Set the id attribute of the eventElement to be the same as the input id.
  // Replace <> with the correct HTML attribute
  eventElement.id = `event-${id}`;
  return eventElement;
}

function createTitleForEvent(event) {
  var title = document.createElement('div');
  // title.classList.add('col', 'event-title');
  title.innerHTML = event.name;
  return title;
}

function updateDOM() {
  const events = CALENDAR_EVENTS;

  events.forEach((event, id) => {
    // First, let's try to update the event if it already exists.

    // @TODO: Use the `id` parameter to fetch the object if it already exists.
    // Replace <> with the appropriate variable name
    // In templated strings, you can include variables as ${var_name}.
    // For eg: let name = 'John';
    // let msg = `Welcome ${name}`;
    let eventElement = document.querySelector(`#event-${id}`);

    // if event is undefined, i.e. it doesn't exist in the CALENDAR_EVENTS array, make a new one.
    if (eventElement == null) {
      eventElement = createEventElement(id);
      const title = createTitleForEvent(event);
      // @TODO: Append the title to the event element. Use .append() or .appendChild()
      eventElement.append(title);

    } else {
      // @TODO: Remove the old element while updating the event.
      // Use .remove() with the eventElement to remove the eventElement.
      eventElement.remove();
    }

    // Add the event name
    const title = eventElement.querySelector('div.event-title');
    title.innerHTML = event.name;

    // Add a tooltip with more information on hover
    // @TODO: you will add code here when you are working on for Part C.
    eventElement.setAttribute('data-bs-toggle', 'tooltip');
    eventElement.setAttribute('data-bs-title', `${event.name}, ${event.weekday}, ${event.date}, ${event.start_time},${event.end_time}, ${event.location}`);


    // @TODO: On clicking the event div, it should open the modal with the fields pre-populated.
    // Replace "<>" with the triggering action.
    eventElement.setAttribute('onclick', `openEventModal({id: ${id}})`);

    // Add the event div to the parent
    document
      .querySelector(`#${event.day} .event-container`)
      .appendChild(eventElement);
  });

  updateTooltips(); // Declare the function in the script.js. You will define this function in Part B.
}

/********************** PART C: 1. Display Tooltip ***************************/

function updateTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

}