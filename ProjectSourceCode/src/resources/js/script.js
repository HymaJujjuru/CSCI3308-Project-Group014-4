//Code copied from Lab 4


const EVENTS = [
    // Not sure if I need something here
  ];

let EVENT_MODAL;

 /* ********************** Modal Functions ************************************** */
function initializeEventModal() {
    // @TODO: Create a modal using JS. The id will be `event-modal`:
    // Reference: https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
    EVENT_MODAL = new bootstrap.Modal(document.getElementById('event-modal'))
  }

  function openEventModal({ id, date }) {
    // Since we will be reusing the same modal for both creating and updating events,
    // we're creating variables to reference the title of the modal and the submit button
    // in javascript so we can update the text suitably
    const submit_button = document.querySelector("#submit_button");
    const modal_title = document.querySelector(".modal-title");
    // Check if the event exists in the EVENTS by using `id`
    // Note that on the first try, when you attempt to access an event that does not exist
    // an event will be added to the list. This is expected.
    let event = EVENTS[id];
    // If event is undefined, i.e it does not exist in the EVENTS, then we create a new event.
    // Else, we load the current event into the modal.
    if (!event) {
      event = {
        class: "",
        date: date,
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
      id = CALENDAR_EVENTS.length;
    } else {
      // We will default to "Update Event" as the text for the title and the submit button
      modal_title.innerHTML = "Update Event";
      submit_button.innerHTML = "Update Event";
    }
    // Once the event is fetched/created, populate the modal.
    // Use document.querySelector('<>').value to get the form elements. Replace <>
    // Hint: If it is a new event, the fields in the modal will be empty.
    document.querySelector("#study_class").value = event.class;
    // @TODO: Update remaining form fields of the modal with suitable values from the event.
    document.querySelector("#study_day").value = event.date;
    document.querySelector("#study_time1").value = event.start_time;
    document.querySelector("#study_time2").value = event.end_time;
    document.querySelector("#study_location").value = event.location;
  
  
      // Set the "action" event for the form to call the updateEventFromModal
      // when the form is submitted by clicking on the "Creat/Update Event" button
      const form = document.querySelector("#event-modal form");
      form.setAttribute("action", `javascript:updateEventFromModal(${id})`);
    EVENT_MODAL.show();
  }

  function updateEventFromModal(id) {
    // @TODO: Pick the modal field values using document.querySelecter(<>).value,
    // and assign it to each field in CALENDAR_EVENTS.
    EVENTS[id] = {
        name: document.querySelector("#event_name").value,
        date: document.querySelector("#study_day").value,
        start_time: document.querySelector("#study_time1").value,
        end_time: document.querySelector("#study_time2").value,
        location: document.querySelector("#study_location").value
    };
  
    // Update the dom to display the newly created event and hide the event modal
    updateDOM();
    EVENT_MODAL.hide();
  }