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
          const redirectUrl =
            data.role === "rider"
              ? "/delivery/delivery.html"
              : "/order/order.html";
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

function showRegistrationForm(){
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("loginform").style.display = "none";
  document.getElementById("registerpopup").style.display = "none";
}
