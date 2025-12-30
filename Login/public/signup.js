document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        emailError.textContent = data.Message || "Signup failed";
        return;
      }
      localStorage.setItem("pendingEmail", email);

      window.location.href = "http://127.0.0.1:5500/Login/public/otp.html";
    } catch (error) {
      console.error(error);
      alert("SERVER ERROR");
    }
  });
