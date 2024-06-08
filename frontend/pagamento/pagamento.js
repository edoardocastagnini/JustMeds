document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});

function updateNavigation() {
    fetch('/api/v1/check-login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const logoutLink = document.createElement('a');
                logoutLink.className = 'nav-link';
                logoutLink.href = '/api/logout';
                logoutLink.textContent = 'Logout';
                navBar.appendChild(logoutLink);

                const accountIcon = document.getElementById('accountIcon');
                accountIcon.style.display = 'block';
                const accountName = document.createElement("span");
                accountName.textContent = ' Il mio Account';
                accountIcon.appendChild(accountName);
            } else {
                const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
                const loginLink = document.createElement('a');
                loginLink.className = 'nav-link';
                loginLink.href = '../auth/login.html';
                loginLink.textContent = 'Registrati/Accedi';
                navBar.appendChild(loginLink);
            }
        })
        .catch(error => console.error('Error checking login status:', error));
}

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    try {
        const response = await fetch(`/api/v1/ordini/${orderId}`);
        if (!response.ok) {
            throw new Error('Errore nel recuperare i dettagli dell\'ordine');
        }
        const order = await response.json();
        const orderSummary = document.getElementById('orderSummary');
        
        const initialTotal = order.prodotti.reduce((total, product) => total + (product.prezzo * product.quantita), 0);
        const finalTotal = order.prezzoFinale;
        const totalWithCommission = finalTotal + 5;

        orderSummary.innerHTML = `
            <h4>Riepilogo Ordine</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Prodotto</th>
                        <th>Quantità</th>
                        <th>Prezzo</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.prodotti.map(p => `
                        <tr>
                            <td>${p._id.Farmaco}</td>
                            <td>${p.quantita}</td>
                            <td>€${(p.prezzo * p.quantita).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>Prezzo Iniziale:</strong> €${initialTotal.toFixed(2)}</p>
            <p><strong>Prezzo Finale:</strong> €${finalTotal}</p>
            <p><strong>Prezzo con Commissioni (+5€):</strong> €${totalWithCommission}</p>
        `;
    } catch (error) {
        console.error('Errore durante il recupero dei dettagli dell\'ordine:', error);
    }

    document.getElementById('paymentForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        try {
            const response = await fetch('/api/v1/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            });

            if (response.ok) {
                alert('Pagamento effettuato con successo');
                window.location.href = '../client_account/client.html';
            } else {
                alert('Errore durante il pagamento');
            }
        } catch (error) {
            console.error('Errore durante il pagamento:', error);
        }
    });

    document.getElementById('cancelOrder').addEventListener('click', async function() {
        try {
            const response = await fetch(`/api/v1/ordini/${orderId}/cancella`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                alert('Ordine annullato con successo');
                window.location.href = '../client_account/client.html';
            } else {
                alert('Errore durante l\'annullamento dell\'ordine');
            }
        } catch (error) {
            console.error('Errore durante l\'annullamento dell\'ordine:', error);
        }
    });
});