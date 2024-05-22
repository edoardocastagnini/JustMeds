async function aggiornaPrezzo(index, orderId) {
  const nuovoPrezzo = document.getElementById(`prezzoAggiornato-${index}`).value;
  const inputBox = document.getElementById(`prezzoAggiornato-${index}`);
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

    loadOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico', 'storicoOrdiniSection');
    loadOrders('in_corso', 'ordiniInCorsoTableBody', '/api/ordini/incorso', 'ordiniInCorsoSection');
    loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati', 'listaOrdiniCandidatiSection');
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
    return farmaco.Farmaco;
  } catch (error) {
    console.error('Errore nel recuperare il farmaco:', error);
    return id;
  }
}

async function mostraInfoOrdine(orderId) {
  try {
    const response = await fetch(`/api/ordini/${orderId}`);
    if (!response.ok) {
      throw new Error(`Errore durante il recupero dell'ordine con ID ${orderId}`);
    }
    const ordine = await response.json();
    document.getElementById('currentOrderId').value = orderId;
    const modal = new bootstrap.Modal(document.getElementById('verifyCodeModal'));
    modal.show();
  } catch (error) {
    console.error('Errore durante il recupero dell\'ordine:', error);
    alert('Errore durante il recupero dell\'ordine.');
  }
}

async function verifyCode() {
  const orderId = document.getElementById('currentOrderId').value;
  const verificationCode = document.getElementById('verificationCode').value;
  const url = `/api/ordini/${orderId}/verifyCode`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ verificationCode })
    });

    if (!response.ok) {
      throw new Error(`Errore durante la verifica del codice. Status: ${response.status}`);
    }

    const result = await response.json();
    if (result.valid) {
      document.getElementById('verificationCode').classList.add('success-input');
      document.getElementById('verificationCode').disabled = true;
      alert('Codice confermato! Stato dell\'ordine aggiornato a "inconsegna".');
    } else {
      document.getElementById('verificationCode').classList.add('error-input');
      alert('Codice non valido.');
    }
  } catch (error) {
    console.error('Errore durante la verifica del codice:', error);
    alert('Errore durante la verifica del codice.');
  }
}

async function loadOrders(stato, containerId, endpoint, section) {
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

      let buttonLabel = 'Indaga';
      let buttonAction = `data-bs-toggle="collapse" data-bs-target="#orderDetails-${orders.indexOf(order)}" aria-expanded="false" aria-controls="orderDetails-${orders.indexOf(order)}"`;

      if (section === 'ordiniInCorsoSection') {
        buttonLabel = 'Consegna';
        buttonAction = `onclick="mostraInfoOrdine('${order._id}')"`
      }

      const riderName = order.riderID || 'Non ancora designato';

      const orderElement = document.createElement('tr');
      orderElement.innerHTML = `
        <td>${orders.indexOf(order) + 1}</td>
        <td>${order._id}</td>
        <td>${productNames.join(', ')}</td>
        <td>${order.prodotti.map(p => p.quantita).join(', ')}</td>
        <td>${order.prezzoFinale || order.prodotti.reduce((total, p) => total + (p.quantita * p.prezzo), 0).toFixed(2)}</td>
        <td>${order.indirizzoCliente.nome} ${order.indirizzoCliente.cognome}</td>
        ${section === 'ordiniInCorsoSection' ? `<td>${riderName}</td>` : ''}
        <td><button class="btn btn-primary" ${buttonAction}>${buttonLabel}</button></td>
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
              ${section === 'ordiniInCorsoSection' ? `<h5>Rider ID: ${riderName}</h5>` : ''}
              ${section === 'ordiniInCorsoSection' ? '' : `
                <div>
                  <label for="prezzoAggiornato-${orders.indexOf(order)}">Prezzo Aggiornato:</label>
                  <input type="number" id="prezzoAggiornato-${orders.indexOf(order)}" step="0.01">
                  <button id="aggiornaPrezzo-${orders.indexOf(order)}" class="btn btn-success" onclick="aggiornaPrezzo(${orders.indexOf(order)}, '${order._id}')">Aggiorna Prezzo</button>
                  <button id="confermaOrdine-${orders.indexOf(order)}" class="btn btn-primary" style="display: none;" onclick="cambiaStatoOrdine(${orders.indexOf(order)}, '${order._id}', 'accettato')">Conferma Ordine</button>
                  <button id="eliminaOrdine-${orders.indexOf(order)}" class="btn btn-danger" onclick="cambiaStatoOrdine(${orders.indexOf(order)}, '${order._id}', 'rifiutato')">Elimina Ordine</button>
                </div>
              `}
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

async function loadStoricoOrders(stato, containerId, endpoint) {
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
      container.innerHTML = '<tr><td colspan="3">Nessun ordine trovato.</td></tr>';
      return;
    }

    for (const order of orders) {
      const orderElement = document.createElement('tr');
      orderElement.innerHTML = `
        <td>${orders.indexOf(order) + 1}</td>
        <td>${order._id}</td>
        <td><button class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#storicoOrderDetails-${orders.indexOf(order)}" aria-expanded="false" aria-controls="storicoOrderDetails-${orders.indexOf(order)}">Dettagli</button></td>
      `;
      container.appendChild(orderElement);

      const indirizzoCliente = `${order.indirizzoCliente.via}, ${order.indirizzoCliente.città}, ${order.indirizzoCliente.paese}`;

      const detailsRow = document.createElement('tr');
      detailsRow.innerHTML = `
        <td colspan="3" class="hiddenRow">
          <div id="storicoOrderDetails-${orders.indexOf(order)}" class="accordion-collapse collapse">
            <div class="card card-body">
              <h5>Dettagli Prodotti</h5>
              <ul id="productDetails-${orders.indexOf(order)}">
                ${order.prodotti.map((p, i) => `<li>Quantità: ${p.quantita}, Prezzo: €${p.prezzo.toFixed(2)}</li>`).join('')}
              </ul>
              <h5>Prezzo Totale: €${order.prodotti.reduce((total, p) => total + (p.quantita * p.prezzo), 0).toFixed(2)}</h5>
              <h5>Cliente: ${order.indirizzoCliente.nome} ${order.indirizzoCliente.cognome}</h5>
              <h5>Indirizzo: ${indirizzoCliente}</h5>
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
      container.innerHTML = '<tr><td colspan="3">Errore durante il caricamento degli ordini.</td></tr>';
    }
  }
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

// Funzione aggiornata per caricare gli ordini in corso con stato "attesa" e "inconsegna"
async function loadInCorsoOrders(containerId, endpoint) {
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

      let buttonLabel = 'Consegna';
      let buttonAction = `onclick="mostraInfoOrdine('${order._id}')"`

      const riderName = order.riderID || 'Non ancora designato';

      const orderElement = document.createElement('tr');
      orderElement.innerHTML = `
        <td>${orders.indexOf(order) + 1}</td>
        <td>${order._id}</td>
        <td>${productNames.join(', ')}</td>
        <td>${order.prodotti.map(p => p.quantita).join(', ')}</td>
        <td>${order.prezzoFinale || order.prodotti.reduce((total, p) => total + (p.quantita * p.prezzo), 0).toFixed(2)}</td>
        <td>${order.indirizzoCliente.nome} ${order.indirizzoCliente.cognome}</td>
        <td>${riderName}</td>
        <td><button class="btn btn-primary" ${buttonAction}>${buttonLabel}</button></td>
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
              <h5>Rider ID: ${riderName}</h5>
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

document.addEventListener("DOMContentLoaded", function () {
  fetchLoginStatus().then((data) => {
    if (data.isLoggedIn) {
      setupLogoutLink();
    }
  });

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

    // Nascondi il form Crea Account Farmacia se presente
    if (sectionId !== 'accountSection') {
      const accountSection = document.getElementById('accountSection');
      if (accountSection) {
        accountSection.style.display = 'none';
      }
    }
  }

  async function loadProfileSettings() {
    try {
      // Carica le informazioni del profilo utente
      const profileResponse = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (!profileResponse.ok) {
        throw new Error('Errore durante il caricamento del profilo');
      }
      const profileData = await profileResponse.json();
      document.getElementById('profileEmail').textContent = profileData.email;
      document.getElementById('profileRole').textContent = profileData.type;
  
      // Carica le informazioni della farmacia
      const farmaciaResponse = await fetch(`/api/farmacia/${profileData.farmaciaID}`, {
        credentials: 'include'
      });
      if (!farmaciaResponse.ok) {
        throw new Error('Errore durante il caricamento delle informazioni della farmacia');
      }
      const farmaciaData = await farmaciaResponse.json();
      document.getElementById('farmaciaNome').textContent = farmaciaData.FARMACIA;
      document.getElementById('farmaciaCodice').textContent = farmaciaData._id;
      document.getElementById('farmaciaIVA').textContent = farmaciaData.IVA;
      document.getElementById('farmaciaCAP').textContent = farmaciaData.CAP;
      document.getElementById('farmaciaComune').textContent = farmaciaData.COMUNE;
      document.getElementById('farmaciaProvincia').textContent = farmaciaData.PROVINCIA;
      document.getElementById('farmaciaRegione').textContent = farmaciaData.REGIONE;
      document.getElementById('farmaciaIndirizzo').textContent = farmaciaData.INDIRIZZO;
    } catch (error) {
      console.error('Errore durante il caricamento delle impostazioni del profilo:', error);
    }
  }

  window.aggiornaPrezzo = aggiornaPrezzo;
  window.cambiaStatoOrdine = cambiaStatoOrdine;
  window.mostraInfoOrdine = mostraInfoOrdine;
  window.verifyCode = verifyCode;

  loadProfileSettings();
  loadStoricoOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico');
  loadInCorsoOrders('ordiniInCorsoTableBody', '/api/ordini/incorso'); // Usa la funzione aggiornata
  loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati', 'listaOrdiniCandidatiSection');

  // Mostra la sezione "Impostazioni" di default
  showSection('impostazioniSection');

  document.querySelectorAll("#sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  fetch('/api/check-login', {
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if (!data.isLoggedIn || data.userRole !== 'farmacia') {
      window.location.href = '../auth/login.html'; // Ridirige alla pagina di login se non loggato o non è una farmacia
    }
  })
  .catch(error => {
    console.error('Errore durante il controllo dello stato di login:', error);
    window.location.href = '../auth/login.html'; // Ridirige alla pagina di login in caso di errore
  });
});
