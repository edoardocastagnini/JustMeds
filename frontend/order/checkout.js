document.addEventListener('DOMContentLoaded', function() {
    fetchLoginStatus().then((data) => {
      if (data.isLoggedIn) {
          addAccountIcon();
        setupLogoutLink();
      }
    });

    fetch('/api/user/address', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if(data) {
                document.getElementById('user-address').innerHTML = `
                    <strong>Nome:</strong> ${data.nome} ${data.cognome}<br>
                    <strong>Indirizzo:</strong> ${data.via}, ${data.città}, ${data.paese}
                `;
            } else {
                document.getElementById('user-address').textContent = 'Indirizzo non disponibile.';
            }
        })
        .catch(error => {
            console.error('Errore nel caricare i dati utente:', error);
            document.getElementById('user-address').textContent = 'Errore nel caricare l\'indirizzo.';
        });

    fetch('/api/cart/details', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const itemsList = document.getElementById('cart-items');
                itemsList.innerHTML = ''; // Pulisci la lista se ci sono vecchi valori
                data.items.forEach(item => {
                    itemsList.innerHTML += `<li>${item.nome} - ${item.quantità} - Prezzo: €${item.prezzo.toFixed(2)}</li>`;
                });
                document.getElementById('total-price').textContent = `Totale: €${data.totalPrice.toFixed(2)}`;
            } else {
                document.getElementById('cart-items').innerHTML = '<li>Carrello vuoto.</li>';
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento dei dettagli del carrello:', error);
            document.getElementById('cart-items').innerHTML = '<li>Errore nel caricare gli articoli del carrello.</li>';
        });

    // Carica la lista delle farmacie
    fetch('/api/farmacie', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            console.log('Farmacie:', data); // Log per verificare i dati ricevuti
            const farmaciaSelect = document.getElementById('farmacia-select');
            if (data.success && data.farmacie.length > 0) {
                data.farmacie.forEach(farmacia => {
                    const option = document.createElement('option');
                    option.value = farmacia._id;
                    option.textContent = `${farmacia.FARMACIA} - ${farmacia.INDIRIZZO}, ${farmacia.COMUNE}`;
                    farmaciaSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nessuna farmacia disponibile';
                farmaciaSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Errore nel caricamento delle farmacie:', error);
        });

    document.getElementById('submit-order').addEventListener('click', function() {
        const selectedFarmaciaId = document.getElementById('farmacia-select').value;
        if (!selectedFarmaciaId) {
            alert('Seleziona una farmacia prima di inviare l\'ordine.');
            return;
        }


        fetch('/api/order/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ farmaciaId: selectedFarmaciaId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Ordine inviato alla farmacia');
                window.location.href = '../index.html';
            } else {
                alert('Errore nell\'invio dell\'ordine: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Errore nell\'invio dell\'ordine:', error);
            alert('Errore tecnico nell\'invio dell\'ordine.');
        });
    });
});

function addAccountIcon(){
    const navBar = document.querySelector(".navbar-nav");
    const accountIconLink = document.createElement("a");
    accountIconLink.className = "nav-link";
    accountIconLink.href = "/client_account/client.html";
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