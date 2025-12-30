document
  .getElementById("ForgotPasswordPage")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const oldPassInput = document.getElementById("oldPassword");
    const newPassInput = document.getElementById("newPassword");
    const errorMsg = document.getElementById("errorMsg");
    const successMsg = document.getElementById("successMsg");

    if (!emailInput || !oldPassInput || !newPassInput) {
      console.error("Input elements missing in HTML");
      return;
    }

    const email = emailInput.value.trim();
    const oldPassword = oldPassInput.value.trim();
    const newPassword = newPassInput.value.trim();

    errorMsg.textContent = "";
    successMsg.textContent = "";

    if (!email || !oldPassword || !newPassword) {
      errorMsg.textContent = "All fields are required";
      return;
    }

    try {
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
        errorMsg.textContent = data.Message || "Password change failed";
        return;
      }

      successMsg.textContent =
        data.Message || "Password changed successfully";

      oldPassInput.value = "";
      newPassInput.value = "";
      setTimeout(() => {
        window.location.href =
          "http://127.0.0.1:5500/Login/public/WebPage.html";
      }, 1500);
    } catch (error) {
      errorMsg.textContent = "Server not reachable. Try again later.";
      console.error(error);
    }
  });
