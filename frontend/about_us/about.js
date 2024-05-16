document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/check-login', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                document.getElementById('cartIcon').style.display = 'block';
                document.getElementById('logoutLink').style.display = 'block';
                document.getElementById('loginLink').style.display = 'none';
            } else {
                document.getElementById('logoutLink').style.display = 'none';
                document.getElementById('loginLink').style.display = 'block';
                document.getElementById('cartIcon').style.display = 'none';
            }
        })
        .catch(error => console.error('Error checking login status:', error));
});