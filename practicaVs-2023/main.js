import { useStyle } from "./src/components/styles";
import { kebabCase, addEvents } from "./src/utils";
import { removeLoader, addLoader } from './src/components/loader';

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
      <img src="./src/assets/Endava.png" alt="summer">
      <div class="search-bar text-center mb-4">
        <input type="text" id="searchInput" placeholder="Search events...">
        <button id="searchButton">Search</button>
      </div>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content" class="orders">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
    </div>
  `;
}


function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}

async function renderHomePage(eventData) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

 const response = await fetch("http://localhost:8080/api/events");
 const data = await response.json();
 console.log(data);
 const mainDiv = document.querySelector('.events');
 data.forEach((event) => {
  mainDiv.appendChild(createEvent(event));
  setupCheckOut(event);
 });
}
async function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();

  const response = await fetch('http://localhost:8080/api/orders');
  const data = await response.json();
  const table = createOrdersTable(data);
  const mainDiv = document.querySelector('.orders');
  mainDiv.appendChild(table);
}

function createOrdersTable(orders) {
  const table = document.createElement('table');
  table.classList.add('orders-table');
  table.style.borderCollapse = 'separate';
  table.style.borderSpacing = '50px';

  // Create table header row
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th>Customer Name</th>
      <th>Event Name</th>
      <th>Ticket Category</th>
      <th>Number of Tickets</th>
      <th>Price per Ticket</th>
      <th>Total Price</th>
  `;
  table.appendChild(headerRow);

  // Create table rows for each order
  orders.forEach((order) => {
      const orderRow = document.createElement('tr');
      orderRow.classList.add('order');

     
orderRow.innerHTML = `
<td>${order.customer.customerName}</td>
<td>${order.ticketCategory.event.eventName}</td>
<td contenteditable="true">${order.ticketCategory.ticketDescription}</td>
<td contenteditable="true">${order.numberOfTickets}</td>
<td>$${order.ticketCategory.ticketPrice}</td>
<td>$${order.totalPrice}</td>
`;
      table.appendChild(orderRow);
  });

  return table;
}

// Render content based on URL
function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  var path = window.location.pathname;
  var page = path.split("/").pop();

  if (url === '/' ||  page === 'index.html') {
    renderHomePage();
  } else if (url === '/'|| page === 'orders') {
    renderOrdersPage();
}
}

//Custom descriptions for each Event 
 const eventDescriptions = {
  Untold: "The 'Untold' Music Festival is an extraordinary and electrifying celebration of music and culture, renowned for its unparalleled lineup, immersive experiences, and vibrant atmosphere.",
  "Wine Festival": "The Wine Festival is an annual event that brings together wine enthusiasts, connoisseurs, and casual drinkers alike, creating an ambiance of joy, relaxation, and camaraderie.",
  "Electric Castle" : "Nestled amidst the historic walls of a magnificent Transylvanian castle, the Electric Castle festival transports attendees into a surreal world where the past and the future coexist harmoniously.",
  "Meci de fotbal": "Join us for an intense and action-packed Football Match. Witness the clash of titans on the field as two rival teams battle for victory, displaying skillful tactics and breathtaking goals."
};

const createEvent = (eventData) => {
  const eventCard = document.createElement("div");
  eventCard.className = "event-card"; 

  // Create the event card content
  const contentMarkup = `
    <div class="event">
      <h4 class="event-title text-center">${eventData.eventName}</h4>
      <img src="images/${eventData.eventName}.jpg" alt="Event Image" class="event-image">
    </div>
    <div class="event-description" style="margin-top: 20px; margin-bottom: 40px;">${eventDescriptions[eventData.eventName] || "No description available"}</div>
    <div class="buy-button-container">
      <button class="custom-buy-button" id="checkout-${eventData.eventId}" data-event-id="${eventData.eventId}">Buy Tickets</button>
      <button class="event-details-button" data-event-id="${eventData.eventId}">Event Details</button>
    </div>
  `;
  eventCard.innerHTML = contentMarkup;

  const ticketCategoryMarkup = `
    <div class="ticket-category">
      <label for="ticketCategory-${eventData.eventId}">Select Ticket Category:</label>
      <select id="ticketCategory-${eventData.eventId}" class="ticket-category-select">
        <option value="1">Standard</option>
        <option value="2">VIP</option>
      </select>
    </div>
  `;
  eventCard.insertAdjacentHTML("beforeend", ticketCategoryMarkup);

  const ticketQuantityMarkup = `
  <div class="ticket-quantity">
    <input type="number" class="ticket-input" id="ticketNumbers-${eventData.eventId}" value="0" min="0">
    <button class="increment-button">+</button>
    <button class="decrement-button">-</button>
  </div>
`;
eventCard.insertAdjacentHTML("beforeend", ticketQuantityMarkup);

  // Add event listeners to the ticket quantity buttons
  const ticketInput = eventCard.querySelector('.ticket-input');
  const decrementButton = eventCard.querySelector('.decrement-button');
  const incrementButton = eventCard.querySelector('.increment-button');

  decrementButton.addEventListener('click', () => {
    if (ticketInput.value > 0) {
      ticketInput.value = parseInt(ticketInput.value) - 1;
    }
  });

  incrementButton.addEventListener('click', () => {
    ticketInput.value = parseInt(ticketInput.value) + 1;
  });

  // Add event listener to the "Event Details" button
  const detailsButton = eventCard.querySelector('.event-details-button');
  detailsButton.addEventListener('click', () => {
    openEventDetailsPopup(eventData); 
  });

  return eventCard;
};


function setupCheckOut(eventData){
  const checkOutButton = document.querySelector('#checkout-'+ eventData.eventId);
  const numberOfTickets = document.querySelector('#ticketNumbers-' + eventData.eventId);
  const ticketCategorySelect = document.querySelector('#ticketCategory-' + eventData.eventId);

  checkOutButton.addEventListener("click", async (event) => {
    const total = numberOfTickets.value;
    const ticketCategory = ticketCategorySelect.value;

    console.log(eventData.eventId);
    console.log(total);
    console.log(ticketCategory);

    fetch('http://localhost:8080/api/orders/customer/1', {
      method: "POST",
      body: JSON.stringify({
        eventID: +eventData.eventId,
        ticketCategoryID: +ticketCategory,
        numberOfTickets: +total
      }),
      headers:{
        'Accept': 'application/json',
        'Content-type': 'application/json'
      }
    });
  });
}

function searchEvents(query, events) {
  return events.filter(event => {
    const eventName = event.eventName.toLowerCase();
    return eventName.includes(query.toLowerCase());
  });
}


document.addEventListener('DOMContentLoaded', () => {
  
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  searchButton.addEventListener('click', async () => {
    const response = await fetch("http://localhost:8080/api/events");
    const data = await response.json();

    const searchTerm = searchInput.value.trim();
    const filteredEvents = searchEvents(searchTerm, data);

    const mainDiv = document.querySelector('.events');
    mainDiv.innerHTML = '';

    filteredEvents.forEach((event) => {
      mainDiv.appendChild(createEvent(event));
    });
  });
});


//Pop-up function with the Events' details
function openEventDetailsPopup(eventData) {
  const popup = document.getElementById('eventDetailsPopup');
  const eventName = document.getElementById('eventName');
  const eventDate = document.getElementById('eventDate');
  const eventDescription = document.getElementById('eventDescription');
  const closePopupBtn = document.getElementById('closeEventDetailsPopup');

  eventName.textContent = eventData.eventName;

  // Format and display the event start and end dates with both date and time components
  const startDate = new Date(eventData.startDate).toLocaleString();
  const endDate = new Date(eventData.endDate).toLocaleString();
  eventDate.textContent = `${startDate} - ${endDate}`;
  
  eventDescription.textContent = eventData.eventDescription;

  popup.style.display = 'block';

  closePopupBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });
}



// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();


