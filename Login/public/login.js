document.getElementById("loginform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

   
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    emailError.textContent = "";
    passwordError.textContent = "";

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            passwordError.textContent =
              data.Message || data.error || "Invalid login credentials";
            return;
        }

        window.location.href =
          "http://127.0.0.1:5500/Login/public/WebPage.html";

    } catch (error) {
        passwordError.textContent = "Server error. Try again later.";
    }
});
