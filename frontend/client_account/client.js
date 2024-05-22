
document.addEventListener("DOMContentLoaded", () => {
  fetchLoginStatus().then((data) => {
    if (data.isLoggedIn) {
      addCartIcon();
      setupLogoutLink();
    }
  });
});



function addCartIcon() {
  const navBar = document.querySelector(".navbar-nav");
  const cartIconLink = document.createElement("a");
  cartIconLink.className = "nav-link";
  cartIconLink.href = "/order/cart.html"; 
  cartIconLink.id = "cartIconLink";
  const icon = document.createElement("i");
  icon.className = "fas fa-shopping-cart";
  cartIconLink.appendChild(icon);
  const cartName = document.createElement("span");
  cartName.textContent = " Carrello";
  cartIconLink.appendChild(cartName);

  navBar.appendChild(cartIconLink);
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

document.addEventListener("DOMContentLoaded", function () {
  function showSection(sectionId) {
    document.querySelectorAll("#content > div").forEach(section => {
      section.classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === 'impostazioniSection') {
      loadProfile();
    } else if (sectionId === 'orderSection') {
      loadOrders();
    }
  }

  async function loadProfile() {
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Errore durante il caricamento del profilo');
      }
      const profile = await response.json();
      document.getElementById('profileEmail').textContent = profile.email;
      document.getElementById('profileName').textContent = profile.name;
      document.getElementById('profileSurname').textContent = profile.surname;
      document.getElementById('profileCity').textContent = profile.city;
      document.getElementById('profileCap').textContent = profile.cap;
      document.getElementById('profileProvince').textContent = profile.province;
      document.getElementById('profileAddress').textContent = profile.address;
    } catch (error) {
      console.error('Errore durante il caricamento del profilo:', error);
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch('/api/ordini', { credentials: 'include' });
      console.log(response);
      if (!response.ok) {
        throw new Error('Errore durante il caricamento degli ordini');
      }
      const orders = await response.json();
      const container = document.getElementById('orderSection').querySelector('table tbody');
      container.innerHTML = '';

      if (!Array.isArray(orders) || orders.length === 0) {
        container.innerHTML = '<tr><td colspan="8">Nessun ordine trovato.</td></tr>';
        return;
      }

      const sortedOrders = orders.sort((a, b) => a.stato === 'inviato' ? -1 : 1);

      sortedOrders.forEach((order, index) => {
        const totalOrderPrice = order.prodotti.reduce((total, product) => total + (product.prezzo * product.quantita), 0);
        const orderElement = document.createElement('tr');
        orderElement.innerHTML = `
          <td>${index + 1}</td>
          <td>${order.stato}</td>
          <td>${order.prodotti.map(p => `${p._id.Farmaco} - ${p.quantita}`).join('<br>')}</td>
          <td>${order.prodotti.map(p => `€${(p.prezzo * p.quantita).toFixed(2)}`).join('<br>')}</td>
          <td>${order.farmaciaNome}</td>
          <td>${order.indirizzoCliente.città}, ${order.indirizzoCliente.cap},${order.indirizzoCliente.provincia},${order.indirizzoCliente.via}</td>
          <td><button class="btn btn-primary" onclick='indaga("${order._id}", "${order.farmaciaID}", ${totalOrderPrice.toFixed(2)}, ${order.prezzoFinale})'>Dettagli</button></td>
        `;
        container.appendChild(orderElement);
      });
    }catch (error) {
      console.error('Errore durante il caricamento degli ordini:', error);
      const container = document.getElementById('orderSection').querySelector('table tbody');
      container.innerHTML = '<tr><td colspan="8">Errore durante il caricamento degli ordini.</td></tr>';
    }
  }

  async function enableEditProfile() {
    document.getElementById('profileCity').contentEditable = true;
    document.getElementById('profileCap').contentEditable = true;
    document.getElementById('profileProvince').contentEditable = true;
    document.getElementById('profileAddress').contentEditable = true;
    document.getElementById('saveProfileBtn').classList.remove('hidden');
  }

  async function saveProfile() {
    const address = document.getElementById('profileAddress').textContent;
    const city = document.getElementById('profileCity').textContent;
    const cap = document.getElementById('profileCap').textContent;
    const province = document.getElementById('profileProvince').textContent;

    try {
      const response = await fetch('/api/editprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ city, cap, province, address})
      });
      if (!response.ok) {
        throw new Error('Errore durante il salvataggio del profilo');
      }
      alert('Profilo aggiornato con successo');
      document.getElementById('profileAddress').contentEditable = false;
      document.getElementById('profileCity').contentEditable = false;
      document.getElementById('profileCap').contentEditable = false;
      document.getElementById('profileProvince').contentEditable = false;
      document.getElementById('saveProfileBtn').classList.add('hidden');
    } catch (error) {
      console.error('Errore durante il salvataggio del profilo:', error);
    }
  }



  function indaga(orderId, farmaciaId, totalPrice, finalPrice) {
    alert(`ID ordine: ${orderId}\nID farmacia: ${farmaciaId}\nPrezzo totale di riferimento: €${totalPrice}\nPrezzo totale finale: €${finalPrice}`);
  }

  showSection('orderSection');
  window.showSection = showSection;
  window.indaga = indaga;
  window.enableEditProfile = enableEditProfile;
  window.saveProfile = saveProfile;
});