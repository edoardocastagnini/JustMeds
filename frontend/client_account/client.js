
document.addEventListener("DOMContentLoaded", () => {
    fetchLoginStatus()
      .then((data) => {
        if (data.isLoggedIn) {
          addCartIcon();
          setupLogoutLink();
          removeLoginLink();
        } else {
          setupUnauthenticatedButtons(); // Setup per utenti non autenticati
        }
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
      });
  });

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
      .then((response) => response.json())
      .then((data) => {
        return data; // Assicurati che data sia l'oggetto che include isLoggedIn e userRole
      })
      .catch((error) => {
        console.error("Error fetching login status:", error);
        throw error;
      });
  }

 

  function addCartIcon() {
    const navBar = document.querySelector(".navbar-nav");
    const cartIconLink = document.createElement("a");
    cartIconLink.className = "nav-link";
    cartIconLink.href = "/order/cart.html"; 
    cartIconLink.id = "cartIconLink";
    const icon = document.createElement("i");
    icon.className = "fas fa-shopping-cart";
    cartIconLink.appendChild(icon);
    const cartName = document.createElement("span");
    cartName.textContent = " Carrello";
    cartIconLink.appendChild(cartName);

    navBar.appendChild(cartIconLink);
}


document.addEventListener("DOMContentLoaded", function () {
    function showSection(sectionId) {
      document.querySelectorAll("#content > div").forEach(section => {
        section.classList.add("hidden");
      });
      document.getElementById(sectionId).classList.remove("hidden");
  
    if (sectionId === 'impostazioniSection') {
        loadProfile();
    }
    if (sectionId === 'orderSection') {
        loadOrders();
    }
    }

  
    async function loadProfile() {
     fetch('/api/profile', {credentials: 'include'}).then(response => response.json()).then(data => {
        document.getElementById('profileName').textContent = data.name;
        document.getElementById('profileSurname').textContent = data.surname;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profileAddress').textContent = data.address;
        document.getElementById('profileCity').textContent = data.city;
    }).catch(error => {
        console.error('Error loading profile:', error);
    }
    );
    }
    
    async function loadOrders() {
 
       
    }

    showSection('impostazioniSection');
    window.showSection = showSection;

  
  });

  