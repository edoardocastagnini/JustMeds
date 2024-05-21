async function aggiornaPrezzo(index, orderId) {
  const nuovoPrezzo = document.getElementById(`prezzoAggiornato-${index}`).value;
  const inputBox = document.getElementById(`prezzoAggiornato-${index}`);
  const aggiornaButton = document.getElementById(`aggiornaPrezzo-${index}`);
  const confermaButton = document.getElementById(`confermaOrdine-${index}`);
  const eliminaButton = document.getElementById(`eliminaOrdine-${index}`);

  if (!nuovoPrezzo) {
    alert("Inserisci un prezzo valido.");
    return;
  }

  const url = `/api/ordini/${orderId}/aggiornaPrezzo`;
  console.log(`Chiamata API a: ${url} con prezzoFinale: ${nuovoPrezzo}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prezzoFinale: nuovoPrezzo })
    });

    if (!response.ok) {
      throw new Error(`Errore durante l'aggiornamento del prezzo. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Prezzo aggiornato per l'ordine ${orderId}:`, result);
    alert(`Prezzo aggiornato con successo a €${nuovoPrezzo}`);
    
    inputBox.classList.add('success-input');
    
    if (confermaButton) {
      confermaButton.style.display = 'inline-block';
    }
    if (eliminaButton) {
      eliminaButton.style.display = 'inline-block';
    }
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del prezzo:', error);
    alert('Errore durante l\'aggiornamento del prezzo.');
    
    inputBox.classList.remove('success-input');
  }
}

async function cambiaStatoOrdine(index, orderId, stato) {
  const url = `/api/ordini/${orderId}/cambiaStato`;
  console.log(`Chiamata API a: ${url} con stato: ${stato}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stato })
    });

    if (!response.ok) {
      throw new Error(`Errore durante l'aggiornamento dello stato. Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Stato aggiornato per l'ordine ${orderId}:`, result);
    alert(`Stato dell'ordine aggiornato con successo a ${stato}`);

    const inputBox = document.getElementById(`prezzoAggiornato-${index}`);
    const aggiornaButton = document.getElementById(`aggiornaPrezzo-${index}`);
    const confermaButton = document.getElementById(`confermaOrdine-${index}`);
    const eliminaButton = document.getElementById(`eliminaOrdine-${index}`);
    if (inputBox) {
      inputBox.disabled = true;
    }
    if (aggiornaButton) {
      aggiornaButton.style.display = 'none';
    }
    if (confermaButton) {
      confermaButton.style.display = 'none';
    }
    if (eliminaButton) {
      eliminaButton.style.display = 'none';
    }

    loadOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico');
    loadOrders('in_corso', 'ordiniInCorsoTableBody', '/api/ordini/incorso');
    loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dello stato:', error);
    alert('Errore durante l\'aggiornamento dello stato.');
  }
}
async function getFarmacoNome(id) {
  try {
    const response = await fetch(`/api/farmaci/${id}`);
    if (!response.ok) {
      throw new Error(`Errore nel recuperare il farmaco con ID ${id}`);
    }
    const farmaco = await response.json();
    return farmaco.Farmaco; // Assuming 'Farmaco' is the field for the name
  } catch (error) {
    console.error('Errore nel recuperare il farmaco:', error);
    return id; // In case of error, return the ID itself
  }
}
document.addEventListener("DOMContentLoaded", function () {

  function showSection(sectionId) {
    document.querySelectorAll("#content > div").forEach(section => {
      section.classList.add("hidden");
    });
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove("hidden");
    } else {
      console.error("Section not found:", sectionId);
    }
  }

  async function loadProfileSettings() {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Errore durante il caricamento delle impostazioni del profilo');
      }
      const profile = await response.json();
      document.getElementById('profileEmail').textContent = profile.email;
      document.getElementById('profileRole').textContent = profile.type;

      const farmaciaResponse = await fetch(`/api/farmacia/${profile.id}`, {
        credentials: 'include'
      });
      if (!farmaciaResponse.ok) {
        console.error(`Errore durante il caricamento delle informazioni della farmacia. Status: ${farmaciaResponse.status}`);
        throw new Error(`Errore durante il caricamento delle informazioni della farmacia. Status: ${farmaciaResponse.status}`);
      }
      const farmacia = await farmaciaResponse.json();
      document.getElementById('farmaciaNome').textContent = farmacia.FARMACIA;
      document.getElementById('farmaciaCodice').textContent = farmacia.COD_FARMACIA;
      document.getElementById('farmaciaIVA').textContent = farmacia.IVA;
      document.getElementById('farmaciaCAP').textContent = farmacia.CAP;
      document.getElementById('farmaciaComune').textContent = farmacia.COMUNE;
      document.getElementById('farmaciaProvincia').textContent = farmacia.PROVINCIA;
      document.getElementById('farmaciaRegione').textContent = farmacia.REGIONE;
      document.getElementById('farmaciaIndirizzo').textContent = farmacia.INDIRIZZO;
    } catch (error) {
      console.error('Errore durante il caricamento delle impostazioni del profilo:', error);
    }
  }

 

  async function aggiornaPrezzo(index, orderId) {
    const nuovoPrezzo = document.getElementById(`prezzoAggiornato-${index}`).value;
    const inputBox = document.getElementById(`prezzoAggiornato-${index}`);
    const aggiornaButton = document.getElementById(`aggiornaPrezzo-${index}`);
    const confermaButton = document.getElementById(`confermaOrdine-${index}`);
    const eliminaButton = document.getElementById(`eliminaOrdine-${index}`);

    if (!nuovoPrezzo) {
      alert("Inserisci un prezzo valido.");
      return;
    }

    const url = `/api/ordini/${orderId}/aggiornaPrezzo`;
    console.log(`Chiamata API a: ${url} con prezzoFinale: ${nuovoPrezzo}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prezzoFinale: nuovoPrezzo })
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento del prezzo. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Prezzo aggiornato per l'ordine ${orderId}:`, result);
      alert(`Prezzo aggiornato con successo a €${nuovoPrezzo}`);
      inputBox.classList.add('success-input');
      confermaButton.style.display = 'inline-block';

      aggiornaButton.style.display = 'none';
      eliminaButton.style.display = 'inline-block';
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del prezzo:', error);
      alert('Errore durante l\'aggiornamento del prezzo.');
    }
  }

  async function cambiaStatoOrdine(index, orderId, stato) {
    const url = `/api/ordini/${orderId}/cambiaStato`;
    console.log(`Chiamata API a: ${url} con stato: ${stato}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stato })
      });

      if (!response.ok) {
        throw new Error(`Errore durante l'aggiornamento dello stato. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Stato aggiornato per l'ordine ${orderId}:`, result);
      alert(`Ordine ${stato} con successo`);

      loadOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico');
      loadOrders('in_corso', 'ordiniInCorsoTableBody', '/api/ordini/incorso');
      loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato:', error);
      alert('Errore durante l\'aggiornamento dello stato.');
    }
  }

  window.aggiornaPrezzo = aggiornaPrezzo;
  window.cambiaStatoOrdine = cambiaStatoOrdine;

  loadProfileSettings();
  loadOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico');
  loadOrders('in_corso', 'ordiniInCorsoTableBody', '/api/ordini/incorso');
  loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati');

  document.querySelectorAll("#sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });
});

async function loadOrders(stato, containerId, endpoint) {
  try {
    const response = await fetch(endpoint, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Errore durante il caricamento degli ordini');
    }
    const orders = await response.json();
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = '<tr><td colspan="8">Nessun ordine trovato.</td></tr>';
      return;
    }

    for (const order of orders) {
      const productNames = await Promise.all(order.prodotti.map(async (prodotto) => {
        const nome = await getFarmacoNome(prodotto._id);
        return nome;
      }));

      const orderElement = document.createElement('tr');
      orderElement.innerHTML = `
        <td>${orders.indexOf(order) + 1}</td>
        <td>${order._id}</td>
        <td>${productNames.join(', ')}</td>
        <td>${order.prodotti.map(p => p.quantita).join(', ')}</td>
        <td>${order.prodotti.map(p => p.prezzo.toFixed(2)).join(', ')}</td>
        <td>${order.indirizzoCliente.nome} ${order.indirizzoCliente.cognome}</td>
        <td>${order.indirizzoCliente.via}, ${order.indirizzoCliente.città}, ${order.indirizzoCliente.paese}</td>
        <td><button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#orderDetails-${orders.indexOf(order)}" aria-expanded="false" aria-controls="orderDetails-${orders.indexOf(order)}">Indaga</button></td>
      `;
      container.appendChild(orderElement);

      const detailsRow = document.createElement('tr');
      detailsRow.innerHTML = `
        <td colspan="8" class="hiddenRow">
          <div id="orderDetails-${orders.indexOf(order)}" class="accordion-collapse collapse">
            <div class="card card-body">
              <h5>Dettagli Prodotti</h5>
              <ul id="productDetails-${orders.indexOf(order)}">
                ${order.prodotti.map((p, i) => `<li>${productNames[i]} - Quantità: ${p.quantita}, Prezzo: €${p.prezzo.toFixed(2)}</li>`).join('')}
              </ul>
              <h5>Prezzo Totale: €${order.prodotti.reduce((total, p) => total + (p.quantita * p.prezzo), 0).toFixed(2)}</h5>
              <div>
                <label for="prezzoAggiornato-${orders.indexOf(order)}">Prezzo Aggiornato:</label>
                <input type="number" id="prezzoAggiornato-${orders.indexOf(order)}" step="0.01">
                <button id="aggiornaPrezzo-${orders.indexOf(order)}" class="btn btn-success" onclick="aggiornaPrezzo(${orders.indexOf(order)}, '${order._id}')">Aggiorna Prezzo</button>
                <button id="confermaOrdine-${orders.indexOf(order)}" class="btn btn-primary" style="display: none;" onclick="cambiaStatoOrdine(${orders.indexOf(order)}, '${order._id}', 'accettato')">Conferma Ordine</button>
                <button id="eliminaOrdine-${orders.indexOf(order)}" class="btn btn-danger" onclick="cambiaStatoOrdine(${orders.indexOf(order)}, '${order._id}', 'rifiutato')">Elimina Ordine</button>
              </div>
            </div>
          </div>
        </td>
      `;
      container.appendChild(detailsRow);
    }
  } catch (error) {
    console.error('Errore durante il caricamento degli ordini:', error);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<tr><td colspan="8">Errore durante il caricamento degli ordini.</td></tr>';
    }
  }
}
