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
        return data; // Assicurati che data sia l'oggetto che include isLoggedIn e userRole
      })
      .catch((error) => {
        console.error("Error fetching login status:", error);
        throw error;
      });
  }
  
  
  
  
  document.addEventListener("DOMContentLoaded", async () => {
      try {
          const response = await fetch('/api/v1/orders');
          if (!response.ok) {
              throw new Error("Network response was not ok");
          }
          const orders = await response.json();
          const ordersContainer = document.getElementById("ordersContainer");
  
          if (!orders || orders.length === 0) {
              const noOrderMessage = document.createElement("p");
              noOrderMessage.textContent = "Nessun ordine disponibile...";
              ordersContainer.appendChild(noOrderMessage);
              return;
          }
  
          orders.forEach(order => {
              const orderCard = createOrderCard(order);
              ordersContainer.appendChild(orderCard);
          });
  
      } catch (error) {
          console.error("Errore nel caricare gli ordini:", error);
      }
  });
  
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
  
      const detailsButton = document.createElement("button");
      detailsButton.classList.add("btn", "btn-primary", "me-2");
      detailsButton.textContent = "Visualizza Dettagli";
      detailsButton.addEventListener("click", () => {
          window.location.href = `delivery_management.html?orderId=${order._id}`;
      });
      cardBody.appendChild(detailsButton);
  
      orderCard.appendChild(cardBody);
  
      return orderCard;
  }
  