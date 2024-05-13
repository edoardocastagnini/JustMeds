document.addEventListener("DOMContentLoaded", () => {
    fetchLoginStatus()
      .then((data) => {
        if (data.isLoggedIn) {
          setupLogoutLink();
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
        (window.location.href = "/delivery/delivery.html");
      orderNowButton.onclick = () => alert("Accesso non autorizzato."); // O reindirizza dove desiderato
    } else if (userRole === "ricevente") {
      orderNowButton.onclick = () =>
        (window.location.href = "/order/order.html");
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

  function fetchLoginStatus() {
    return fetch("/api/check-login", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        return data; // Assicurati che data sia l'oggetto che include isLoggedIn e userRole
      })
      .catch((error) => {
        console.error("Error fetching login status:", error);
        throw error;
      });
  }