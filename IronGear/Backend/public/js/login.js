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
    btnText.textContent = "Verifying...";
    loader.classList.remove("hidden");

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensures the httpOnly cookie is accepted
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.Message || data.error || "Invalid login credentials"
        );
      }

      /* ✅ NEW LOGIC: Save user details for the UI */
      localStorage.setItem('role', data.role); // This will be "admin" or "user"
      localStorage.setItem('userName', data.name);

      /* 🚀 SMART REDIRECT */
      if (data.role && data.role.toLowerCase() === 'admin') {
        // Admin goes to the Choice Gate
        window.location.href = "http://localhost:5500/IronGear/Backend/public/admin-dashboard.html"; 
      } else {
        // Regular user goes to the main page
        window.location.href = "http://localhost:5500/IronGear/Backend/public/WebPage.html";
      }
    } catch (error) {
      passwordError.textContent = error.message;

      /* 🔥 RESET STATE */
      btn.disabled = false;
      btn.classList.remove("loading");
      btnText.textContent = "Login";
      loader.classList.add("hidden");
    }
  });