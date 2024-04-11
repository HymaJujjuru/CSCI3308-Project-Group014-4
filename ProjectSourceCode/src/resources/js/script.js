/* Code based on Lab 4 */

const EVENTS = [
    // Not sure if I need something here
  ];

let EVENT_MODAL;


 // ********************** Modal Functions **************************************
function initializeEventModal() {
    // Create a modal using JS. The id will be `create-modal`:
    EVENT_MODAL = new bootstrap.Modal(document.getElementById('create-modal'));
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
        class: "",
        date: "",
        start_time: "",
        end_time: "",
        location: "",
      };
      // Update the innerHTML for modalTitle and submitButton
      modal_title.innerHTML = "Create Event";
      submit_button.innerHTML = "Create Event";
      // Allocate a new event id. Note that nothing is inserted into the CALENDAR_EVENTS yet.
      // Set the id to be the length of the CALENDAR_EVENTS because we are adding a new element
      id = EVENTS.length;
    } else {
      // We will default to "Update Event" as the text for the title and the submit button
      modal_title.innerHTML = "Update Event";
      submit_button.innerHTML = "Update Event";
    }
    // Once the event is fetched/created, populate the modal.
    // Use document.querySelector('<>').value to get the form elements. Replace <>
    document.querySelector("#study_class").value = event.class;
    document.querySelector("#study_day").value = event.date;
    document.querySelector("#study_time1").value = event.start_time;
    document.querySelector("#study_time2").value = event.end_time;
    document.querySelector("#study_location").value = event.location;
  
  
      // Set the "action" event for the form to call the updateEventFromModal
      // when the form is submitted by clicking on the "Creat/Update Event" button
      const form = document.querySelector("#create-modal form");
      form.setAttribute("action", `javascript:updateEventFromModal(${id})`);
      if(!EVENT_MODAL)
      {
        EVENT_MODAL = new bootstrap.Modal(document.getElementById('create-modal'));
      }
      EVENT_MODAL.show();
  }

  function updateEventFromModal(id) {
    // Pick the modal field values using document.querySelecter(<>).value,
    // and assign it to each field in CALENDAR_EVENTS.
    EVENTS[id] = {
        name: document.querySelector("#study_class").value,
        date: document.querySelector("#study_day").value,
        start_time: document.querySelector("#study_time1").value,
        end_time: document.querySelector("#study_time2").value,
        location: document.querySelector("#study_location").value
    };
  
    // Update the dom to display the newly created event and hide the event modal
    //updateDOM();
    EVENT_MODAL.hide();
  }

  /***** UPDATE DOM  *****/
  /*
  function createEventElement(id) {
    // @TODO: create a new div element. Use document.createElement().
    var eventElement = document.createElement('div')
    // Adding classes to the <div> element.
    eventElement.classList = "event row border rounded m-1 py-1";
    // @TODO: Set the id attribute of the eventElement to be the same as the input id.
    // Replace <> with the correct HTML attribute
    eventElement.id = `event-${id}`;
    return eventElement;
  }
  
  function createTitleForEvent(event) {
    var title = document.createElement('div');
    title.classList.add('col', 'event-title');
    title.innerHTML = event.name;
    return title;
  }

  function updateDOM() {
    const events = EVENTS;
  
    events.forEach((event, id) => {
      // First, let's try to update the event if it already exists.
  
      // @TODO: Use the `id` parameter to fetch the object if it already exists.
      // Replace <> with the appropriate variable name
      // In templated strings, you can include variables as ${var_name}.
      // For eg: let name = 'John';
      // let msg = `Welcome ${name}`;
      let eventElement = document.querySelector(`#event-${id}`);
  
      // if event is undefined, i.e. it doesn't exist in the CALENDAR_EVENTS array, make a new one.
      if (eventElement === null) {
        eventElement = createEventElement(id);
        const title = createTitleForEvent(event);
  
        // @TODO: Append the title to the event element. Use .append() or .appendChild()
        eventElement.appendChild(title)
      } else {
        // @TODO: Remove the old element while updating the event.
        // Use .remove() with the eventElement to remove the eventElement.
        eventElement.remove()
      }
  
      // Add the event name
      const title = eventElement.querySelector('div.event-title');
      title.innerHTML = event.name;
  
      // Add a tooltip with more information on hover
      // @TODO: you will add code here when you are working on for Part B.
  
      // @TODO: On clicking the event div, it should open the modal with the fields pre-populated.
      // Replace "<>" with the triggering action.
      eventElement.setAttribute('click', `openEventModal({id: ${id}})`);
  
      // Add the event div to the parent
      document
        .querySelector(`#${event.day} .event-container`)
        .appendChild(eventElement);
    });
  
    updateTooltips(); // Declare the function in the script.js. You will define this function in Part B.
  }
  
  */