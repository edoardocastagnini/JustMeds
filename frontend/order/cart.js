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

  // CODICE PER VISUALIZZARE IL CARRELLO
  document.addEventListener("DOMContentLoaded", function () {
    fetchCartItems();
  });

  function fetchCartItems() {
    fetch("/api/cart", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data); // Log dei dati per verificare la struttura
        if (data && data.items && data.items.length > 0) {
          updateCartUI(data.items);
        } else {
          updateCartUI([]); // Se non ci sono articoli nel carrello, passa un array vuoto
          document.getElementById("cartItems").innerHTML =
            "<p>Il tuo carrello è vuoto.</p>";
        }
      })
      .catch((error) => {
        console.error(
          "Errore nel caricare gli articoli del carrello:",
          error
        );
        document.getElementById(
          "cartItems"
        ).innerHTML = `<p>Errore nel caricare gli articoli del carrello: ${error.message}</p>`;
      });
  }

  function updateCartUI(items) {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";
    let total = 0; // Inizializza il totale a zero
    items.forEach((item) => {
      const itemTotal = item.price * item.quantity; // Calcola il totale per ogni articolo
      total += itemTotal; // Aggiungi al totale generale
      container.innerHTML += generateCartItemHTML(item, itemTotal); // Aggiorna il HTML
    });
    if (total > 0) {
      document.getElementById("cartTotal").textContent = total.toFixed(2); // Visualizza il totale
    } else {
      document.getElementById("cartTotal").textContent = 0;
    }
  }

  function generateCartItemHTML(item) {
    return `
    <div class="col-md-4">
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">Prezzo unitario: €${item.price}</p>
                <p class="card-text">Totale: €${
                  item.price * item.quantity
                }</p>
                <p class="card-text">Quantità: 
                  <button class="btn btn-sm btn-outline-secondary" onclick="changeItemQuantity('${
                    item.id
                  }', -1)">-</button>
                      <span class="mx-2" id="qty-${item.id}">${
      item.quantity
    }</span>
                      <button class="btn btn-sm btn-outline-secondary" onclick="changeItemQuantity('${
                        item.id
                      }', 1)">+</button>
                </p>
                <button class="btn btn-danger" onclick="removeFromCart('${
                  item.id
                }')">Rimuovi</button>
            </div>
        </div>
    </div>
`;
  }

  function removeFromCart(id) {
    fetch("/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Articolo rimosso dal carrello!");
          fetchCartItems(); // Aggiorna la visualizzazione del carrello
          updateCheckoutButton();
        } else {
          alert("Errore nella rimozione dell'articolo.");
        }
      })
      .catch((error) => {
        console.error("Errore nella rimozione dell'articolo:", error);
        alert("Errore nella rimozione dell'articolo.");
      });
  }

  function changeItemQuantity(productId, change) {
    fetch(`/api/cart`, { method: "GET", credentials: "include" }) // Ottieni i dettagli correnti del carrello
      .then((response) => response.json())
      .then((cart) => {
        const item = cart.items.find((item) => item.id === productId);
        if (!item) {
          throw new Error("Articolo non trovato nel carrello.");
        }

        // Controlla se la quantità è 1 e il change è -1, quindi rimuovi l'articolo
        if (item.quantity === 1 && change === -1) {
          removeFromCart(productId); // Chiama una funzione per rimuovere l'articolo
          updateCheckoutButton();
        } else {
          fetch(`/api/cart/change`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId, change }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                fetchCartItems(); // Ricarica gli articoli del carrello per visualizzare la quantità aggiornata
              } else {
                alert(
                  "Errore nella modifica della quantità dell'articolo."
                );
              }
            });
        }
      })
      .catch((error) => {
        console.error(
          "Errore nella modifica della quantità dell'articolo:",
          error
        );
        alert("Errore nella modifica della quantità dell'articolo.");
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkoutButton');
    checkoutButton.addEventListener('click', function() {
        window.location.href = 'checkout.html'; // Modifica con il percorso appropriato alla tua pagina di checkout
    });
});


document.addEventListener('DOMContentLoaded', function() {
  updateCheckoutButton();
});

function updateCheckoutButton() {
  fetch('/api/cart', { credentials: 'include' })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      if (data && data.items && data.items.length > 0) {
          // Se il carrello ha elementi, abilita il pulsante di checkout
          document.getElementById('checkoutButton').disabled = false;
      } else {
          // Se il carrello è vuoto, disabilita il pulsante di checkout
          document.getElementById('checkoutButton').disabled = true;
          document.getElementById('checkoutButton').title = "Il carrello è vuoto";
      }
  })
  .catch(error => {
      console.error('Errore nel caricare gli articoli del carrello:', error);
      // Opzionalmente, gestisci gli errori mostrando un messaggio all'utente
  });
}