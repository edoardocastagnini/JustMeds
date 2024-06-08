document.addEventListener("DOMContentLoaded", function () {
  let pharmacies = [];

  // Funzione per recuperare e visualizzare le richieste di assistenza
  function fetchFormRequests() {
    fetch("/api/admin/v1/form_requests")
      .then(response => response.json())
      .then(data => {
        const tableBody = document.querySelector("#requestsTable tbody");
        tableBody.innerHTML = ''; // Svuota la tabella prima di riempirla
        data.forEach((request, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${request.name}</td>
            <td>${request.email}</td>
            <td>${request.orderNumber}</td>
            <td>${request.message}</td>
            <td>${new Date(request.createdAt).toLocaleString()}</td>
            <td>
              <button class="btn btn-info" onclick="investigateRequest('${request._id}', this)">Indaga</button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch(error => console.error("Error fetching form requests:", error));
  }
// Funzione per mostrare la sezione selezionata
window.showSection = function(sectionId) {
  document.querySelectorAll("#content > div").forEach(section => {
    section.classList.add("hidden");
  });
  document.getElementById(sectionId).classList.remove("hidden");

  // Nascondi la sezione dell'account farmacia quando si cambia sezione
  const accountSection = document.getElementById("accountSection");
  if (accountSection) {
    accountSection.style.display = "none"; 
  }

  // Esegui azioni specifiche per ogni sezione
  if (sectionId === "formRequestsSection") {
    fetchFormRequests();
  } else if (sectionId === "statsSection") {
    fetchStats();
  }
}

  window.investigateRequest = function(requestId, button) {
    const row = button.closest("tr");
    const nextRow = row.nextElementSibling;
    const accountSection = document.getElementById("accountSection");
  
    if (nextRow && nextRow.classList.contains("expanded-row")) {
      nextRow.remove();
      if (accountSection) {
        accountSection.style.display = "none";
      }
    } else {
      // Chiudi tutte le altre righe espanse
      document.querySelectorAll(".expanded-row").forEach(expandedRow => expandedRow.remove());

      const expandedRow = document.createElement("tr");
      expandedRow.classList.add("expanded-row");
      expandedRow.innerHTML = `
        <td colspan="7">
          <strong>Azioni:</strong>
          <button class="btn btn-success" onclick="answerRequest('${requestId}', this)">Rispondi</button>
          <button class="btn btn-primary" onclick="showAccountSection('${row.children[1].textContent}', '${row.children[2].textContent}')">Crea Account Farmacia</button>
          <button class="btn btn-danger" onclick="deleteRequest('${requestId}', this)">Elimina Definitivamente</button>
        </td>
      `;
      row.parentNode.insertBefore(expandedRow, row.nextSibling);
      if (accountSection) {
        accountSection.style.display = "none"; 
      }
    }
  }



  //Funzione per rispondere ad una richiesta
  window.answerRequest = function(requestId, button) {
    const row = button.closest("tr");
    const message = prompt("Inserisci la risposta alla richiesta:");
    if (message) {
      fetch(`/api/admin/v1/form_requests/answer/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer: message })
      })
      .then(response => {
        if (response.ok) {
          alert("Risposta inviata con successo.");
          fetchFormRequests(); 
        } else {
          alert("Errore durante l'invio della risposta.");
        }
      })
      .catch(error => console.error("Error answering request:", error));
    }
  }

  // Funzione per eliminare una richiesta
  window.deleteRequest = function(requestId, button) {
    if (confirm("Sei sicuro di voler eliminare questa richiesta?")) {
      fetch(`/api/admin/v1/form_requests/delete/${requestId}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          alert("Richiesta eliminata con successo.");
          fetchFormRequests(); 
        } else {
          alert("Errore durante l'eliminazione della richiesta.");
        }
      })
      .catch(error => console.error("Error deleting request:", error));
    }
  }

  // Funzione per mostrare la sezione per creare un account farmacia
  window.showAccountSection = function(name, email) {
    const accountSection = document.getElementById("accountSection");
    accountSection.style.display = "block";  
    document.getElementById("pharmacyEmail").value = email; 
    document.getElementById("pharmacyManagerName").value = name; 
  }
  
  // Funzione per gestire la creazione di un nuovo account farmacia
  document.getElementById("createPharmacyForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch("/api/admin/v1/create_pharmacy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert("Account farmacia creato con successo!");
        this.reset();
        document.getElementById("accountSection").classList.add("hidden");
      } else {
        alert("Errore nella creazione dell'account: " + result.message);
      }
    })
    .catch(error => console.error("Error creating pharmacy account:", error));
  });

  // Funzione per filtrare le farmacie
  window.filterPharmacies = function() {
    const searchTerm = document.getElementById("pharmacySearch").value.toLowerCase();
    const filteredPharmacies = pharmacies.filter(pharmacy => pharmacy.FARMACIA.toLowerCase().includes(searchTerm)).slice(0, 5);
    displayPharmacies(filteredPharmacies);
  }

  // Funzione per visualizzare le farmacie
function displayPharmacies(pharmacies) {
  const pharmacyList = document.getElementById("pharmacyList");
  pharmacyList.innerHTML = '';
  if (pharmacies.length > 0) {
    pharmacies.forEach(pharmacy => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = pharmacy.FARMACIA;
      listItem.onclick = () => selectPharmacy(pharmacy);
      pharmacyList.appendChild(listItem);
    });
    pharmacyList.classList.add("show");
  } else {
    pharmacyList.classList.remove("show");
  }
}

  // Funzione per selezionare una farmacia
function selectPharmacy(pharmacy) {
  document.getElementById("pharmacyId").value = pharmacy._id; 
  document.getElementById("pharmacyName").value = pharmacy.FARMACIA;
  document.getElementById("pharmacyCountry").value = "Italia"; // Italia paese predefinito
  document.getElementById("pharmacyCity").value = pharmacy.COMUNE;
  document.getElementById("pharmacyStreet").value = pharmacy.INDIRIZZO;
  document.getElementById("pharmacyList").innerHTML = ''; 
  document.getElementById("pharmacyList").classList.remove("show");

  // Rendi i campi non editabili
  document.getElementById("pharmacyId").classList.add("non-editable");
  document.getElementById("pharmacyName").classList.add("non-editable");
  document.getElementById("pharmacyCountry").classList.add("non-editable");
  document.getElementById("pharmacyCity").classList.add("non-editable");
  document.getElementById("pharmacyStreet").classList.add("non-editable");
}


  // Funzione per recuperare e visualizzare le statistiche
  function fetchStats() {
    fetch("/api/admin/v1/stats")
      .then(response => response.json())
      .then(stats => {
        const tableBody = document.querySelector("#statsTable tbody");
        tableBody.innerHTML = ''; 
        for (const [collection, count] of Object.entries(stats)) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${collection}</td>
            <td>${count}</td>
          `;
          tableBody.appendChild(row);
        }
      })
      .catch(error => console.error("Error fetching stats:", error));
  }

  // Mostra la lista delle farmacie quando la barra di ricerca ottiene il focus
  document.getElementById("pharmacySearch").addEventListener("focus", function() {
    document.getElementById("pharmacyList").classList.add("show");
  });

  // Nascondi la lista delle farmacie quando la barra di ricerca perde il focus
  document.getElementById("pharmacySearch").addEventListener("blur", function() {
    setTimeout(() => {
      document.getElementById("pharmacyList").innerHTML = '';
      document.getElementById("pharmacyList").classList.remove("show");
    }, 200); // Delay per consentire il clic sull'elemento della lista
  });

  // Recupera la lista delle farmacie
  fetch("/api/admin/v1/pharmacies")
    .then(response => response.json())
    .then(data => {
      pharmacies = data;
      displayPharmacies(pharmacies);
    })
    .catch(error => console.error("Error fetching pharmacies:", error));

  // Mostra la sezione delle statistiche di default
  showSection('statsSection');
});
