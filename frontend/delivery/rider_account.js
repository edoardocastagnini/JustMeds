document.addEventListener("DOMContentLoaded", () => {
    fetchLoginStatus().then((data) => {
      if (data.isLoggedIn) {
        setupLogoutLink();
      }
    }
    );
});

function setupLogoutLink() {
    const navBar = document.querySelector(".navbar-nav");
    const logoutLink = document.createElement("a");
    logoutLink.className = "nav-link";
    logoutLink.href = "/logout";
    logoutLink.textContent = "Logout";
    navBar.appendChild(logoutLink);
  }


  document.addEventListener('DOMContentLoaded', function () {
    const showEarningsBtn = document.getElementById('showEarningsBtn');
    const currentDeliveryBtn = document.getElementById('currentDeliveryBtn');
    const earningsDetails = document.getElementById('earningsDetails');
  
    // Mostra Guadagni button click event
    showEarningsBtn.addEventListener('click', function () {
 
    // Recupera i guadagni 
        fetch('/api/v1/rider_account/earnings')
        .then((response) => response.json())
        .then((earnings) => {
          console.log(earnings);
          // Mostra i guadagni nel pop up
          earningsDetails.innerHTML = `
            <p>Guadagni a consegna: 5€</p>
            <p>Totale Guadagni: ${earnings.total}€</p>
            <p>Numero di consegne effettuate: ${earnings.total / 5}</p>
          `;
  
          // Mostra il pop up
          const earningsModal = new bootstrap.Modal(document.getElementById('earningsModal'));
          earningsModal.show();
        });
    });
  
    // Reindirizza alla consegna attuale
    currentDeliveryBtn.addEventListener('click', function () {
      window.location.href = 'ongoing_delivery.html';
    });
  });
  


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


  