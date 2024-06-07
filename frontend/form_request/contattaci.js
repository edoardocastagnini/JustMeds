document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/check-login', { method: 'GET', credentials: 'include' })
      .then(response => response.json())
      .then(data => {
          if (data.isLoggedIn) {
              const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
              if(data.userRole === 'farmacia'){
                  const reservedAreaLink = document.createElement('a');
                  reservedAreaLink.className = 'nav-link';
                  reservedAreaLink.href = '/farmacia/farmacia.html';
                  reservedAreaLink.textContent = 'Zona Riservata';
                  navBar.appendChild(reservedAreaLink);
              }
              if(data.userRole === 'ricevente'){
                  // ICONA CARRELLO
                  const cartIcon = document.getElementById('cartIcon');
                  cartIcon.style.display = 'block';
                  const cartName = document.createElement("span");
                  cartName.textContent = " Carrello";
                  cartIcon.appendChild(cartName);
                  // ICONA ACCOUNT con " Il mio account"
                  const accountIcon = document.getElementById('accountIcon');
                  accountIcon.style.display = 'block';
                  const accountName = document.createElement("span");
                  accountName.textContent = ' Il mio Account';
                  accountIcon.appendChild(accountName);
              }
              const logoutLink = document.createElement('a');
              logoutLink.className = 'nav-link';
              logoutLink.href = '/api/logout';
              logoutLink.textContent = 'Logout';
              navBar.appendChild(logoutLink);
      
          }else{
              const navBar = document.querySelector('#navbarNavAltMarkup .navbar-nav');
              const loginLink = document.createElement('a');
              loginLink.className = 'nav-link';
              loginLink.href = '../auth/login.html';
              loginLink.textContent = 'Registrati/Accedi';
              navBar.appendChild(loginLink);
          }
      })
      .catch(error => console.error('Error checking login status:', error));
});




document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contactForm').addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        orderNumber: document.getElementById('orderNumber').value,
        message: document.getElementById('message').value
      };
  
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => console.error('Error:', error));
    });

    fetch('/api/check-login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                document.getElementById('cartIcon').style.display = 'block';
                document.getElementById('logoutLink').style.display = 'block';
                document.getElementById('loginLink').style.display = 'none';
                document.getElementById('accountIcon').style.display = 'block';
            } else {
                document.getElementById('logoutLink').style.display = 'none';
                document.getElementById('loginLink').style.display = 'block';
                document.getElementById('cartIcon').style.display = 'none';
                document.getElementById('accountIcon').style.display = 'none';
            }
        })
        .catch(error => console.error('Error checking login status:', error));
  });
  