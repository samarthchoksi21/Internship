document
  .getElementById("loginform")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const btn = document.getElementById("loginBtn");
    const btnText = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".btn-loader");

    emailError.textContent = "";
    passwordError.textContent = "";

    if (!email || !password) {
      passwordError.textContent = "Email and password are required";
      return;
    }

    /* 🔥 ENTER LOADING STATE */
    btn.disabled = true;
    btn.classList.add("loading");
    btnText.textContent = "Logging in...";
    loader.classList.remove("hidden");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.Message || data.error || "Invalid login credentials"
        );
      }

      window.location.href =
        "http://127.0.0.1:5500/Login/public/WebPage.html";

    } catch (error) {
      passwordError.textContent = error.message;

      /* 🔥 RESET STATE */
      btn.disabled = false;
      btn.classList.remove("loading");
      btnText.textContent = "Login";
      loader.classList.add("hidden");
    }
  });
