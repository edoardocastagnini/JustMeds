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
                logoutLink.href = '/logout';
                logoutLink.textContent = 'Logout';
                navBar.appendChild(logoutLink);
        
                //navBar.insertBefore(logoutLink, cartIcon);  //ICONA PRIMA DI LOGOUT
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