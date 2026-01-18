document.getElementById("ForgotPasswordPage").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");
  const button = document.querySelector(".shop-btn");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (!email) {
    errorMsg.textContent = "Email is required";
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Sending OTP...";

    const response = await fetch("http://localhost:3000/forgotpasswordemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.Message || "Something went wrong";
      return;
    }


    successMsg.textContent = data.Message;
    localStorage.setItem("pendingEmail", email);
    window.location.href = "http://localhost:5500/IronGear/Backend/public/ChangePasswordOtp.html"
  } catch (err) {
    errorMsg.textContent = "Server error. Try again later.";
  } finally {
    button.disabled = false;
    button.textContent = "Send OTP";
  }
});
