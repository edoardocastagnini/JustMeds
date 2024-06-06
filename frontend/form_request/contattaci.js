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
  