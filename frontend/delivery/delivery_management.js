document.addEventListener("DOMContentLoaded", () => {
    fetchLoginStatus().then((data) => {
      if (data.isLoggedIn) {
        addAccountIcon();
        setupLogoutLink();
      }
    });
  });
  
  // Aggiunta dell'icona account per la sezione utente
  function addAccountIcon(){
  const navBar = document.querySelector(".navbar-nav");
    const accountIconLink = document.createElement("a");
    accountIconLink.className = "nav-link";
    accountIconLink.href = "./rider_account.html";
    accountIconLink.id = "accountIconLink";
    const icon = document.createElement("i");
    icon.className = "fas fa-user";
    accountIconLink.appendChild(icon);
    const accountName = document.createElement("span");
    accountName.textContent = " Il mio Account";
    accountIconLink.appendChild(accountName);
  
  
    navBar.appendChild(accountIconLink);
  }
  function setupLogoutLink() {
    const navBar = document.querySelector(".navbar-nav");
    const logoutLink = document.createElement("a");
    logoutLink.className = "nav-link";
    logoutLink.href = "/logout";
    logoutLink.textContent = "Logout";
    navBar.appendChild(logoutLink);
  }
  
  function fetchLoginStatus() {
    return fetch("/api/v1/check-login", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        return data; 
      })
      .catch((error) => {
        console.error("Error fetching login status:", error);
        throw error;
      });
  }
  


function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Carica gli ordini dato l'ID
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const orderId = getQueryParam('orderId');
        if (!orderId) {
            console.error("No order ID found in URL");
            return;
        }

        console.log("Fetching order...");
        const response = await fetch(`/api/v1/orders/${orderId}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const order = await response.json(); 
        console.log("Order fetched:", order);
        const waitingOrdersContainer = document.getElementById("waitingOrders");

        if (!order) {
            const noOrderMessage = document.createElement("p");
            noOrderMessage.textContent = "Ordine non trovato...";
            waitingOrdersContainer.appendChild(noOrderMessage);
            return;
        }

        const orderCard = createOrderCard(order);
        waitingOrdersContainer.appendChild(orderCard);

        const geocodePromises = [
            geocodeAddress(order.indirizzoFarmacia, 'pickupMap', "Indirizzo di ritiro"),
            geocodeAddress(order.indirizzoCliente, 'deliveryMap', "Indirizzo di consegna")
        ];
        await Promise.all(geocodePromises);

    } catch (error) {
        console.error("Errore nel caricare l'ordine:", error);
    }
});

// CREA VISUALIZZATORE ORDINE
function createOrderCard(order) {
    const orderCard = document.createElement("div");
    orderCard.classList.add("card", "mb-3");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = `Ordine #${order._id}`;
    cardBody.appendChild(title);

    const productList = document.createElement("ul");
    productList.classList.add("list-group", "list-group-flush");

    let productCounter = 1;

    order.prodotti.forEach((product) => {
        const productItem = document.createElement("li");
        productItem.classList.add("list-group-item");
        productItem.textContent = `Farmaco ${productCounter} - Quantità: ${product.quantita} - Prezzo unitario: €${product.prezzo}`;
        productList.appendChild(productItem);
        productCounter++;
    });

    cardBody.appendChild(productList);

    const totalPrice = document.createElement("p");
    totalPrice.classList.add("card-text", "mt-2");
    totalPrice.innerHTML = `<strong>Prezzo Totale:</strong> €${order.prodotti.reduce((acc, item) => acc + (item.quantita * item.prezzo), 0)}`;
    cardBody.appendChild(totalPrice);

    const pickupAddress = document.createElement("p");
    pickupAddress.classList.add("card-text");
    pickupAddress.innerHTML = `<strong>Indirizzo di ritiro:</strong> ${order.indirizzoFarmacia.via}, ${order.indirizzoFarmacia.cap} ${order.indirizzoFarmacia.provincia}`;
    cardBody.appendChild(pickupAddress);

    const deliveryAddress = document.createElement("p");
    deliveryAddress.classList.add("card-text");
    deliveryAddress.innerHTML = `<strong>Indirizzo di consegna:</strong> ${order.indirizzoCliente.via}, ${order.indirizzoCliente.cap} ${order.indirizzoCliente.città}`;
    cardBody.appendChild(deliveryAddress);

    // Bottone "Accetta Incarico"
    const acceptButton = document.createElement("button");
    acceptButton.classList.add("btn", "btn-success", "me-2");
    acceptButton.textContent = "Accetta Incarico";
    acceptButton.addEventListener("click", async () => {
        await acceptOrder(order._id, acceptButton);
    });
    cardBody.appendChild(acceptButton);

    orderCard.appendChild(cardBody);

    return orderCard;
}

// Funzione per mostrare un avviso
function showAlert(message, type = 'success') {
    const alertContainer = document.createElement("div");
    alertContainer.classList.add("alert", `alert-${type}`, "mt-2");
    alertContainer.textContent = message;

    const mainContainer = document.querySelector(".container");
    if (mainContainer) {
        mainContainer.prepend(alertContainer); // Aggiungi l'avviso in cima alla pagina
    } else {
        document.body.prepend(alertContainer); // Fallback se non esiste un container con classe "container"
    }

    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

// ACCETTAZIONE DELL'ORDINE
async function acceptOrder(orderId, acceptButton) {
    try {
        const response = await fetch(`/api/v1/orders/${orderId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Errore durante l'accettazione dell'ordine");
        }

        const result = await response.json();
        console.log(result.message);

        acceptButton.classList.add("disabled");
        acceptButton.disabled = true;

        showAlert("Ordine accettato con successo!");

        // Reindirizza a ongoing_delivery.html con l'ID dell'ordine
        window.location.href = `ongoing_delivery.html?orderId=${orderId}`;

    } catch (error) {
        console.error("Errore nell'accettazione dell'ordine:", error);
        showAlert("Errore durante l'accettazione dell'ordine", 'danger');
    }
}

// VISUALIZZAZIONE MAPPA
async function geocodeAddress(address, mapId, label) {
    // Costruisci la query con le proprietà disponibili
    const queryParts = [];
    if (address.via) queryParts.push(address.via.toLowerCase());
    if (address.cap) queryParts.push(address.cap);
    if (address.provincia) queryParts.push(address.provincia.toLowerCase());
    if (address.città) queryParts.push(address.città.toLowerCase());
    
    const query = queryParts.join(", ");
    console.log(`Geocoding for ${label}:`, query); // Log the address being geocoded
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            console.log(`Coordinates for ${label}:`, lat, lon);
            initMap(mapId, lat, lon, label);
        } else {
            console.error(`No results found for ${label}`);
            handleMapError(mapId, `Nessun risultato trovato per ${label}`);
        }
    } catch (error) {
        console.error(`Geocoding error for ${label}:`, error);
        handleMapError(mapId, `Errore di geocoding per ${label}`);
    }
}

function initMap(mapId, lat, lon, label) {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) {
        console.error(`Map container not found: ${mapId}`);
        return;
    }

    const map = L.map(mapId).setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup(label)
        .openPopup();

    const loadingIndicator = document.querySelector(`#${mapId} .loading`);
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function handleMapError(mapId, message) {
    const mapContainer = document.getElementById(mapId);
    if (mapContainer) {
        mapContainer.innerHTML = `<div class="loading">${message}</div>`;
    } else {
        console.error(`Map container not found for error handling: ${mapId}`);
    }
}
