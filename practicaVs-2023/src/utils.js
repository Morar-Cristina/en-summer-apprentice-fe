
export const kebabCase = (str) => str.replaceAll(' ', '-');
export const addEvents = (events) => {
  const eventsDiv = document.querySelector('.events');
  eventsDiv.innerHTML = 'No events available';

  if(events.length) {
    eventsDiv.innerHTML = '';
    events.forEach((event) => {
      eventsDiv.appendChild(createEvent(event));
    });
  }
};
