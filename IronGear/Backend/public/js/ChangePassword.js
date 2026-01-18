document.getElementById("ForgotPasswordPage").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const oldPassword = document.getElementById("oldPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");
  const button = document.querySelector(".shop-btn");

  // reset messages
  errorMsg.textContent = "";
  successMsg.textContent = "";

  // basic validation
  if (!email || !oldPassword || !newPassword) {
    errorMsg.textContent = "All fields are required";
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Updating...";

    const response = await fetch("http://localhost:3000/change", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        oldPassword,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.Message || "Password update failed";
      return;
    }

    successMsg.textContent = data.Message;


    // Optional: clear form after success
    document.getElementById("ForgotPasswordPage").reset();
    window.location.href = "http://localhost:5500/IronGear/Backend/public/login.html"

  } catch (err) {
    errorMsg.textContent = "Server error. Try again later.";
  } finally {
    button.disabled = false;
    button.textContent = "Change Password";
  }
});
