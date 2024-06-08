let isOrderAccepted = false;
        const cancelButton = document.createElement("button");

        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

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

        function showSecretCode(orderId, secretCode, button) {
            // Crea l'elemento del codice segreto se non esiste
            let secretCodeElement = document.querySelector(`.secret-code-${orderId}`);
            if (!secretCodeElement) {
                secretCodeElement = document.createElement("div");
                secretCodeElement.classList.add(`secret-code-${orderId}`, "mt-2");
                secretCodeElement.style.display = "none"; // Inizia nascosto
                secretCodeElement.innerHTML = `Codice Segreto: ${secretCode} <span class="timer-${orderId}"></span>`;
                button.parentElement.appendChild(secretCodeElement);
            }

            // Mostra il codice segreto
            secretCodeElement.style.display = "block";
            button.style.display = "none"; // Nascondi il bottone

            // Avvia il timer
            let timeLeft = 300; // 300 secondi = 5 minuti
            const timerElement = document.querySelector(`.timer-${orderId}`);
            const timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.textContent = ` (Tempo rimanente: ${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    secretCodeElement.style.display = "none"; // Nascondi il codice segreto
                    button.remove(); // Rimuovi definitivamente il bottone
                }
            }, 1000);
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

            // Bottone "Mostra Codice Segreto"
            const secretCodeButton = document.createElement("button");
            secretCodeButton.classList.add("btn", "btn-primary", "me-2");
            secretCodeButton.textContent = "Mostra Codice Segreto";
            secretCodeButton.addEventListener("click", () => showSecretCode(order._id, order.secretcode, secretCodeButton));
            cardBody.appendChild(secretCodeButton);

            // Bottone "Accetta Incarico"
            const acceptButton = document.createElement("button");
            acceptButton.classList.add("btn", "btn-success", "me-2");
            acceptButton.textContent = "Accetta Incarico";
            acceptButton.addEventListener("click", async () => {
                await acceptOrder(order._id, acceptButton);
            });
            cardBody.appendChild(acceptButton);

            // Bottone "Annulla Accettazione"
            const cancelButton = document.createElement("button");
            cancelButton.classList.add("btn", "btn-danger", "me-2");
            cancelButton.textContent = "Annulla Accettazione";
            cancelButton.style.display = "none";
            cancelButton.addEventListener("click", async () => {
                await cancelOrderAcceptance(order._id, cancelButton, acceptButton);
            });
            cardBody.appendChild(cancelButton);

            orderCard.appendChild(cardBody);

            return orderCard;
        }

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

                const cancelButton = acceptButton.nextElementSibling;
                if (cancelButton) {
                    cancelButton.style.display = "inline-block";
                }
            } catch (error) {
                console.error("Errore nell'accettazione dell'ordine:", error);
            }
        }

        async function cancelOrderAcceptance(orderId, cancelButton, acceptButton) {
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
                acceptButton.classList.remove("disabled");
                acceptButton.disabled = false;
            } catch (error) {
                console.error("Errore nell'annullamento dell'accettazione dell'ordine:", error);
            }
        }

        async function geocodeAddress(address, mapId, label) {
            const query = `${address.via}, ${address.cap} ${address.provincia} ${address.città}`;
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
            const map = L.map(mapId).setView([lat, lon], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
                .bindPopup(label)
                .openPopup();

            // Remove loading indicator
            const loadingIndicator = document.querySelector(`#${mapId} .loading`);
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }

        function handleMapError(mapId, message) {
            const mapContainer = document.getElementById(mapId);
            mapContainer.innerHTML = `<div class="loading">${message}</div>`;
        }