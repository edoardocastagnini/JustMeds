function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Ridireziona in base al ruolo
        let redirectUrl;
        switch (data.role) {
          case "rider":
            redirectUrl = "/delivery/delivery.html";
            break;
          case "admin":
            redirectUrl = "/admin/admin.html";
            break;
          case "farmacia":
            redirectUrl = "/farmacia/farmacia.html";
            break;
          case "ricevente":
          default:
            redirectUrl = "../order/order.html";
            break;
        }
        window.location.href = redirectUrl;
      } else {
        throw new Error("Login failed: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      alert("Login error: " + error.message);
    });
}

function showRegistrationForm() {
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("loginform").style.display = "none";
  document.getElementById("registerpopup").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("form[action='/sign_up']").addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/sign_up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message);
      }

      window.location.href = "SignupSuccess.html";
    } catch (error) {
      alert(`Errore di registrazione: ${error.message}`);
    }
  });
});
