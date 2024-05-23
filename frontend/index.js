document.addEventListener("DOMContentLoaded", () => {
  fetchLoginStatus()
    .then((data) => {
      if (data.isLoggedIn) {
        setupLogoutLink();
        removeLoginLink();
        if (data.userRole === "farmacia") {
          setupReservedAreaLink();
          hideUnauthenticatedLinks();
        } else {
          addCartIcon();
          addAccountIcon();
        }
        setupButtons(data.userRole); // Assicurati che il ruolo utente sia passato correttamente
      } else {
        setupUnauthenticatedButtons(); // Setup per utenti non autenticati
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
    });
});

function setupButtons(userRole) {
  const orderNowButton = document.getElementById("orderNowButton");
  const deliveryButton = document.getElementById("deliveryButton");

  if (!userRole) {
    // Se non c'è un ruolo utente definito, reindirizza alla pagina di login
    orderNowButton.onclick = () => (window.location.href = "./auth/login.html");
    deliveryButton.onclick = () => (window.location.href = "./auth/login.html");
  } else if (userRole === "rider") {
    deliveryButton.onclick = () =>
      (window.location.href = "./delivery/delivery.html");
    orderNowButton.onclick = () => alert("Accesso non autorizzato."); // O reindirizza dove desiderato
  } else if (userRole === "ricevente") {
    orderNowButton.onclick = () =>
      (window.location.href = "./order/order.html");
    deliveryButton.onclick = () => alert("Accesso non autorizzato."); // O reindirizza dove desiderato
  } else if (userRole === "farmacia") {
    orderNowButton.onclick = () => alert("Accesso non autorizzato."); // O reindirizza dove desiderato
    deliveryButton.onclick = () => alert("Accesso non autorizzato."); // O reindirizza dove desiderato
  } else {
    // Gestisci altri ruoli o impostazioni di default
    orderNowButton.onclick = () => alert("Ruolo non autorizzato.");
    deliveryButton.onclick = () => alert("Ruolo non autorizzato.");
  }
}

function setupUnauthenticatedButtons() {
  const orderNowButton = document.getElementById("orderNowButton");
  const deliveryButton = document.getElementById("deliveryButton");
  orderNowButton.onclick = () => (window.location.href = "./auth/login.html");
  deliveryButton.onclick = () => (window.location.href = "./auth/login.html");
}

function setupLogoutLink() {
  const navBar = document.querySelector(".navbar-nav");
  const logoutLink = document.createElement("a");
  logoutLink.className = "nav-link";
  logoutLink.href = "/logout";
  logoutLink.textContent = "Logout";
  navBar.appendChild(logoutLink);
}

function removeLoginLink() {
  const loginLink = document.getElementById("loginLink");
  if (loginLink) {
      loginLink.parentNode.removeChild(loginLink);
  }
}

function fetchLoginStatus() {
  return fetch("/api/check-login", { credentials: "include" })
    .then(response => response.json())
    .then(data => {
      return data; // Assicurati che data sia l'oggetto che include isLoggedIn e userRole
    })
    .catch(error => {
      console.error("Error fetching login status:", error);
      throw error;
    });
}

function addAccountIcon(){
  const navBar = document.querySelector(".navbar-nav");
  const accountIconLink = document.createElement("a");
  accountIconLink.className = "nav-link";
  accountIconLink.href = "./client_account/client.html";
  accountIconLink.id = "accountIconLink";
  const icon = document.createElement("i");
  icon.className = "fas fa-user";
  accountIconLink.appendChild(icon);
  const accountName = document.createElement("span");
  accountName.textContent = " Il mio Account";
  accountIconLink.appendChild(accountName);

  navBar.appendChild(accountIconLink);
}

function addCartIcon() {
  const navBar = document.querySelector(".navbar-nav");
  const cartIconLink = document.createElement("a");
  cartIconLink.className = "nav-link";
  cartIconLink.href = "./order/cart.html"; 
  cartIconLink.id = "cartIconLink";
  const icon = document.createElement("i");
  icon.className = "fas fa-shopping-cart";
  cartIconLink.appendChild(icon);
  const cartName = document.createElement("span");
  cartName.textContent = " Carrello";
  cartIconLink.appendChild(cartName);

  navBar.appendChild(cartIconLink);
}

function setupReservedAreaLink() {
  const navBar = document.querySelector(".navbar-nav");
  const reservedAreaLink = document.createElement("a");
  reservedAreaLink.className = "nav-link";
  reservedAreaLink.href = "/farmacia/farmacia.html";
  reservedAreaLink.textContent = "Zona Riservata";
  navBar.appendChild(reservedAreaLink);
}

function hideUnauthenticatedLinks() {
  const myAccountLink = document.getElementById('myAccountLink');
  const cartLink = document.getElementById('cartLink');
  const orderLink = document.getElementById('orderLink');

  if (myAccountLink) myAccountLink.style.display = 'none';
  if (cartLink) cartLink.style.display = 'none';
  if (orderLink) orderLink.style.display = 'none';
}
