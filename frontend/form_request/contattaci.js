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
  });
  