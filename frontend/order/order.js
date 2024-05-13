document.addEventListener('DOMContentLoaded', function() {
    fetchDrugs();
    updateNavigation(); 
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const searchTerm = document.querySelector('input[type="text"]').value;
        searchDrugs(searchTerm);
    });
    
});

function updateNavigation() {
    fetch('/api/check-login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const logoutLink = document.createElement('a');
                logoutLink.className = 'nav-link';
                logoutLink.href = '/logout';
                logoutLink.textContent = 'Logout';
                navBar.appendChild(logoutLink);
                // ICONA CARRELLO
                const cartIcon = document.getElementById('cartIcon');
                cartIcon.style.display = 'block';
                //navBar.insertBefore(logoutLink, cartIcon);  //ICONA PRIMA DI LOGOUT
            }else{
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const loginLink = document.createElement('a');
                loginLink.className = 'nav-link';
                loginLink.href = '/login.html';
                loginLink.textContent = 'Registrati/Accedi';
                navBar.appendChild(loginLink);
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}
function fetchDrugs() {
    fetch('/api/drugs', { method: 'GET', credentials: 'include' }) // Assicurati di includere le credenziali per gestire la sessione
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        const isLoggedIn = data.isLoggedIn; // Assumi che il backend invii questa informazione
        updateDrugCards(data.drugs, isLoggedIn);
    })
    .catch(error => {
        console.error('Error loading the drugs:', error);
        alert('Error loading drugs: ' + error.message);
    });
}


function updateDrugCards(drugs, isLoggedIn) {
    const container = document.querySelector('#card-container');
    container.innerHTML = '';
    drugs.forEach(drug => {
        container.innerHTML += generateDrugCard(drug, isLoggedIn);
    });
}



function searchDrugs(searchTerm) {
    fetch(`/api/drugs/search?farmaco=${encodeURIComponent(searchTerm)}`, { method: 'GET', credentials: 'include' })
        .then(handleResponse)
        .then(data => updateDrugCards(data.drugs, data.isLoggedIn, searchTerm)) // Pass searchTerm here
        .catch(error => {
            console.error('Error searching the drugs:', error);
            alert('Error searching drugs: ' + error.message);
        });
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function updateDrugCards(drugs, isLoggedIn, searchTerm) { // Accept searchTerm as a parameter
    const container = document.querySelector('#card-container');
    container.innerHTML = '';

    if (drugs.length > 0) {
        drugs.forEach(drug => {
            container.innerHTML += generateDrugCard(drug, isLoggedIn);
        });
    } else {
        container.innerHTML = `<p>No drugs found for the search term: "${searchTerm}".</p>`; // Use searchTerm correctly here
    }
}

function generateDrugCard(drug, isLoggedIn) {
    let addToCartButton = '';
    if (isLoggedIn) {
        addToCartButton = `<button type="button" class="btn btn-primary mt-3 add-to-cart" data-id="${drug._id}" data-price="${drug.PrezzoRiferimentoSSN}">Aggiungi al Carrello</button>`;
    }
    return `
        <div class="col-md-4">
            <div class="card mb-4 shadow">
                <div class="card-header bg-primary text-white">
                    <h4 class="my-0">${drug.Farmaco}</h4>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${drug.PrezzoRiferimentoSSN} €</h5>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Principio Attivo: ${drug.PrincipioAttivo}</li>
                        <li class="list-group-item">Confezione: ${drug.Confezione}</li>
                        <li class="list-group-item">Ditta: ${drug.Ditta}</li>
                        <li class="list-group-item">ATC: ${drug.ATC}</li>
                        <li class="list-group-item">AIC: ${drug.AIC}</li>
                        <li class="list-group-item">Codice Equivalenza: ${drug.CodiceGruppoEquivalenza}</li>
                    </ul>
                    ${addToCartButton}
                </div>
            </div>
        </div>
    `;
}


//COMPORTAMENTO POP-UP

document.addEventListener('DOMContentLoaded', function() {
const cartIcon = document.getElementById('cartIcon');
const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));

cartIcon.addEventListener('click', function() {
    fetchCartItems();
    cartModal.show();
});

function fetchCartItems() {
     fetch('/api/cart', { credentials: 'include' })
    .then(response => response.json())
    .then(data => {
        updateCartPopup(data.items); // Aggiorna il popup con gli articoli del carrello
    })
    .catch(error => {
        console.error('Errore nel caricare gli articoli del carrello:', error);
        document.getElementById('cartContent').innerHTML = `<p>Errore nel caricare gli articoli del carrello: ${error.message}</p>`;
    });
}

function updateCartPopup(items) {
    const cartContent = document.getElementById('cartContent');
    let total = 0;
    if (items && items.length > 0) {
        cartContent.innerHTML = items.map(item => {
            total += item.price * item.quantity;
            return generateCartItemHTML(item);
        }).join('');
        cartContent.innerHTML += `<div class="total">Totale: €${total.toFixed(2)}</div>`;
    } else {
        cartContent.innerHTML = '<p>Il tuo carrello è vuoto.</p>';
    }
}

function generateCartItemHTML(item) {
    return `
        <div class="d-flex justify-content-between align-items-center border-bottom mb-3">
            <div>
                <h6 class="my-0">${item.name}</h6>
                <div class="quantity-controls">
                    <button class="btn btn-sm btn-outline-secondary decrement" data-id="${item.id}">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary increment" data-id="${item.id}">+</button>
                </div>
            </div>
            <span class="text-muted">€${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `;
}

const cartContent = document.getElementById('cartContent'); // Assicurati che questo ID sia corretto e presente nel tuo HTML
cartContent.addEventListener('click', function(event) {
    if (event.target.classList.contains('increment')) {
        const productId = event.target.dataset.id;
        changeItemQuantity(productId, 1);
    } else if (event.target.classList.contains('decrement')) {
        const productId = event.target.dataset.id;
        changeItemQuantity(productId, -1);
    }
});


function removeFromCart(id) {
      fetch('/api/cart/remove', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: id })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Articolo rimosso dal carrello!');
              fetchCartItems(); // Aggiorna la visualizzazione del carrello
          } else {
              alert('Errore nella rimozione dell\'articolo.');
          }
          
      })
      .catch(error => {
          console.error('Errore nella rimozione dell\'articolo:', error);
          alert('Errore nella rimozione dell\'articolo.');
      });
  }

 function changeItemQuantity(productId, change) {
    fetch(`/api/cart`, { method: 'GET', credentials: 'include' }) // Ottieni i dettagli correnti del carrello
      .then(response => response.json())
      .then(cart => {
          const item = cart.items.find(item => item.id === productId);
          if (!item) {
              throw new Error('Articolo non trovato nel carrello.');
          }

          // Controlla se la quantità è 1 e il change è -1, quindi rimuovi l'articolo
          if (item.quantity === 1 && change === -1) {
              removeFromCart(productId); // Chiama una funzione per rimuovere l'articolo
          } else {
      fetch(`/api/cart/change`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId, change })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              fetchCartItems();  // Ricarica gli articoli del carrello per visualizzare la quantità aggiornata
          } else {
              alert('Errore nella modifica della quantità dell\'articolo.');
          }
        });
      }
          
      })
      .catch(error => {
          console.error('Errore nella modifica della quantità dell\'articolo:', error);
          alert('Errore nella modifica della quantità dell\'articolo.');
      });
  }




// Aggiunta del listener per il bottone "Procedi al checkout"
const checkoutButton = document.getElementById('checkoutButton');
checkoutButton.addEventListener('click', function() {
    window.location.href = 'cart.html'; // Reindirizza l'utente alla pagina del carrello
});
});



document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const productId = button.getAttribute('data-id');
            const quantity = 1;
            const price = button.getAttribute('data-price');
            fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                    price: price
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Prodotto aggiunto al carrello!');
                    console.log('Aggiunto al carrello:', data);
                } else {
                    console.log('Errore nell\'aggiungere il prodotto al carrello:', data);
                    throw new Error(data.message || "Errore sconosciuto");
                }
            })
            .catch(error => {
                console.log('Errore nell\'aggiungere il prodotto al carrello:', error);
                alert('Errore nell\'aggiungere il prodotto al carrello.');
            });
        }
    });
});


