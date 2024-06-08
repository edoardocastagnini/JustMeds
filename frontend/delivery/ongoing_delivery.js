document.addEventListener("DOMContentLoaded", () => {
    fetchLoginStatus().then((data) => {
      if (data.isLoggedIn) {
        addAccountIcon();
        setupLogoutLink();
      }
    });
  });
  
  
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
  


document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Fetching rider's accepted orders...");
        await fetchRiderAcceptedOrders();
    } catch (error) {
        console.error("Errore nel caricare gli ordini:", error);
    }
});

async function fetchRiderAcceptedOrders() {
    try {
        const response = await fetch('/api/v1/rider/ongoing_order'); // URL della nuova API
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const orders = await response.json();
        console.log("Orders fetched:", orders);
        const waitingOrdersContainer = document.getElementById("waitingOrders");

        if (!orders || orders.length === 0) {
            const noOrderMessage = document.createElement("p");
            noOrderMessage.textContent = "Nessun ordine trovato...";
            waitingOrdersContainer.appendChild(noOrderMessage);
            return;
        }

        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            waitingOrdersContainer.appendChild(orderCard);

            const geocodePromises = [
                geocodeAddress(order.indirizzoFarmacia, 'pickupMap', "Indirizzo di ritiro"),
                geocodeAddress(order.indirizzoCliente, 'deliveryMap', "Indirizzo di consegna")
            ];
            Promise.all(geocodePromises);
        });

    } catch (error) {
        console.error("Errore nel caricare gli ordini:", error);
    }
}

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

    // Bottone "Mostra Codice Segreto" che appare solo se l'ordine è in stato "attesa"
    const secretCodeButton = document.createElement("button");
    secretCodeButton.classList.add("btn", "btn-primary", "me-2");
    secretCodeButton.textContent = "Mostra Codice Segreto (Max 5 min)";

    secretCodeButton.style.display = order.stato === "attesa" ? "block" : "none";
    secretCodeButton.addEventListener("click", () => {
        showSecretCode(order._id, order.secretcode, secretCodeButton);
    });
    cardBody.appendChild(secretCodeButton);

    //Bottone "Consegna Effettuata" che appare solo se l'ordine è in stato "in consegna"
    const deliveryButton = document.createElement("button");
    deliveryButton.classList.add("btn", "btn-success", "me-2");
    deliveryButton.textContent = "Consegna Effettuata";
    deliveryButton.style.display = order.stato === "inconsegna" ? "block" : "none";
    deliveryButton.addEventListener("click", async () => {
        confirmOrderDelivery(order._id, deliveryButton);
    }
    );
    cardBody.appendChild(deliveryButton);


    // Bottone "Annulla Accettazione" che appare solo se l'ordine è in stato "attesa"
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("btn", "btn-danger", "me-2");
    cancelButton.textContent = "Annulla Accettazione";
    cancelButton.style.display = order.stato === "attesa" ? "block" : "none";
    cancelButton.addEventListener("click", () => {
        cancelOrderAcceptance(order._id, cancelButton, secretCodeButton, deliveryButton);
    });
    cardBody.appendChild(cancelButton);
    orderCard.appendChild(cardBody);

    return orderCard;
}

async function confirmOrderDelivery(orderId, deliveryButton) {
    try {
        const response = await fetch(`/api/v1/orders/${orderId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Errore nel completare l'ordine:", error);
        showAlert("Errore durante la conferma della consegna dell'ordine", 'danger');
    }
    deliveryButton.style.display = "none";
    showAlert("Consegna effettuata con successo!");
    //reindirizza alla pagina principale
    window.location.href = '/delivery/rider_account.html';
    
}

function showSecretCode(orderId, secretCode, button) {
    let secretCodeElement = document.querySelector(`.secret-code-${orderId}`);
    if (!secretCodeElement) {
        secretCodeElement = document.createElement("div");
        secretCodeElement.classList.add(`secret-code-${orderId}`, "mt-2");
        secretCodeElement.style.display = "none";
        secretCodeElement.innerHTML = `Codice Segreto: ${secretCode} <span class="timer-${orderId}"></span>`;
        button.parentElement.appendChild(secretCodeElement);
    }

    secretCodeElement.style.display = "block";
    button.style.display = "none";

    let timeLeft = 300;
    const timerElement = document.querySelector(`.timer-${orderId}`);
    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = ` (Tempo rimanente: ${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            secretCodeElement.style.display = "none";
            button.remove();
        }
    }, 1000);
    // Elimina pulsante di annullamento
    const cancelButton = document.querySelector(".btn-danger");
    cancelButton.style.display = "none";

}

async function cancelOrderAcceptance(orderId, cancelButton, secretCodeButton, deliveryButton) {
    try {
        const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Errore durante l'annullamento dell'accettazione dell'ordine");
        }

        const result = await response.json();
        console.log(result.message);

        cancelButton.style.display = "none";
        secretCodeButton.disabled = true;
        deliveryButton.disabled = true;


        showAlert("Accettazione dell'ordine annullata con successo!");
        // Reindirizza alla pagina principale
        window.location.href = '/delivery/delivery.html';

    } catch (error) {
        console.error("Errore nell'annullamento dell'accettazione dell'ordine:", error);
        showAlert("Errore durante l'annullamento dell'accettazione dell'ordine", 'danger');
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.createElement("div");
    alertContainer.classList.add("alert", `alert-${type}`, "mt-2");
    alertContainer.textContent = message;

    const mainContainer = document.querySelector(".container");
    if (mainContainer) {
        mainContainer.prepend(alertContainer);
    } else {
        document.body.prepend(alertContainer);
    }

    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}

async function geocodeAddress(address, mapId, label) {
    const queryParts = [];
    if (address.via) queryParts.push(address.via.toLowerCase());
    if (address.cap) queryParts.push(address.cap);
    if (address.provincia) queryParts.push(address.provincia.toLowerCase());
    if (address.città) queryParts.push(address.città.toLowerCase());

    const query = queryParts.join(", ");
    console.log(`Geocoding for ${label}:`, query);
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
