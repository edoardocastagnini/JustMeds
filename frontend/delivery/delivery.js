document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/check-login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const logoutLink = document.createElement('a');
                logoutLink.className = 'nav-link';
                logoutLink.href = '/api/logout';
                logoutLink.textContent = 'Logout';
                navBar.appendChild(logoutLink);
        
            }else{
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const loginLink = document.createElement('a');
                loginLink.className = 'nav-link';
                loginLink.href = '../auth/login.html';
                loginLink.textContent = 'Registrati/Accedi';
                navBar.appendChild(loginLink);
            }
        })
        .catch(error => console.error('Error checking login status:', error));
  });
  
  
    document.addEventListener("DOMContentLoaded", async () => {
            try {
                const response = await fetch("/api/orders");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const orders = await response.json();
                const confirmedOrders = orders.filter(order => order.stato === 'confermato');

                if (confirmedOrders.length === 0) {
                    const noOrdersMessage = document.createElement("p");
                    noOrdersMessage.textContent = "Nessun ordine disponibile per il ritiro...";
                    ordersContainer.appendChild(noOrdersMessage);
                } else {
                    confirmedOrders.forEach((order, orderIndex) => {
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

                    const deliveryAddress = document.createElement("p");
                    deliveryAddress.classList.add("card-text");
                    deliveryAddress.innerHTML = `<strong>Indirizzo di consegna:</strong> ${order.indirizzoCliente.via}, ${order.indirizzoCliente.cap} ${order.indirizzoCliente.città}`;

                    cardBody.appendChild(pickupAddress);
                    cardBody.appendChild(deliveryAddress);

                    // Pulsante per visualizzare i dettagli
                    const detailsButton = document.createElement("button");
                    detailsButton.classList.add("btn", "btn-primary", "mt-2");
                    detailsButton.textContent = "Visualizza dettagli";
                    detailsButton.onclick = () => {
                        console.log("ID dell'ordine:", order._id);
                        window.location.href = `delivery_management.html?orderId=${order._id}`;
                    };

                    cardBody.appendChild(detailsButton);
                    orderCard.appendChild(cardBody);
                    ordersContainer.appendChild(orderCard);
                        });
                    }
                } catch (error) {
                console.error("Errore nel caricare gli ordini:", error);
            }
    });