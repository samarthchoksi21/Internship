document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // DOM elements
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const btn = document.getElementById("sendOtpBtn");
    const btnText = btn.querySelector(".btn-text");
    const loader = btn.querySelector(".btn-loader");

    // Clear previous errors
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    /* ---------- VALIDATIONS ---------- */

    if (!username) {
      usernameError.textContent = "Username is required";
      return;
    }

    if (!email) {
      emailError.textContent = "Email is required";
      return;
    }

    if (!password) {
      passwordError.textContent = "Password is required";
      return;
    }

    if (password.length < 7) {
      passwordError.textContent = "Password must be at least 7 characters";
      return;
    }

    if (!/[A-Z]/.test(password)) {
      passwordError.textContent =
        "Password must contain at least one capital letter";
      return;
    }

    /* ---------- ENTER LOADING STATE ---------- */
    btn.disabled = true;
    btn.classList.add("loading");
    btnText.textContent = "Sending...";
    loader.classList.remove("hidden");

    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      console.log("Signup route hitted")

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.Message || "Signup failed");
      }
      console.log("Signup route hitted - 2")
      localStorage.setItem("pendingEmail", email);
      window.location.href =
        "/otp.html";
    } catch (error) {
      emailError.textContent = error.message;
      /* ---------- RESET UI ---------- */
      btn.disabled = false;
      btn.classList.remove("loading");
      btnText.textContent = "SEND OTP";
      loader.classList.add("hidden");
    }
  });
