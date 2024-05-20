

document.addEventListener('DOMContentLoaded', function() {
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
});

