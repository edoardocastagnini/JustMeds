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

      // Verifica l'ID del profilo
      console.log('Profile ID:', profile.id);

      const farmaciaResponse = await fetch(`/api/farmacia/${profile.id}`, {
        credentials: 'include'
      });
      if (!farmaciaResponse.ok) {
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

      orders.forEach((order, index) => {
        const orderElement = document.createElement('tr');
        orderElement.innerHTML = `
          <td>${index + 1}</td>
          <td>${order._id}</td>
          <td>${order.prodotti.map(p => p._id).join(', ')}</td>
          <td>${order.prodotti.map(p => p.quantita).join(', ')}</td>
          <td>${order.prodotti.map(p => p.prezzo.toFixed(2)).join(', ')}</td>
          <td>${order.indirizzoCliente.nome} ${order.indirizzoCliente.cognome}</td>
          <td>${order.indirizzoCliente.via}, ${order.indirizzoCliente.città}, ${order.indirizzoCliente.paese}</td>
          <td><button class="btn btn-primary" onclick='indaga("${stato}", ${index}, ${JSON.stringify(order.prodotti)})'>Indaga</button></td>
        `;
        container.appendChild(orderElement);
      });
    } catch (error) {
      console.error('Errore durante il caricamento degli ordini:', error);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<tr><td colspan="8">Errore durante il caricamento degli ordini.</td></tr>';
      }
    }
  }

  async function indaga(stato, index, prodotti) {
    if (stato === 'inviato') {
      try {
        const farmaciDetails = await Promise.all(prodotti.map(async prodotto => {
          const response = await fetch(`/api/farmaci/${prodotto._id}`);
          if (!response.ok) {
            throw new Error(`Errore nel recuperare il farmaco con ID ${prodotto._id}`);
          }
          const farmaco = await response.json();
          return {
            ...prodotto,
            nome: farmaco.Farmaco
          };
        }));

        const dettagli = farmaciDetails.map(f => `${f.nome} (Quantità: ${f.quantita}, Prezzo: ${f.prezzo.toFixed(2)})`).join('\n');
        alert(`Dettagli Farmaci:\n\n${dettagli}`);
      } catch (error) {
        console.error('Errore durante il recupero dei dettagli dei farmaci:', error);
      }
    }
  }

  document.querySelectorAll("#sidebar a").forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      showSection(sectionId);
    });
  });

  loadProfileSettings();
  loadOrders('storico', 'storicoOrdiniTableBody', '/api/ordini/storico');
  loadOrders('in_corso', 'ordiniInCorsoTableBody', '/api/ordini/incorso');
  loadOrders('candidati', 'listaOrdiniCandidatiTableBody', '/api/ordini/candidati');
});
