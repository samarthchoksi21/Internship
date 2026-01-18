const inputs = document.querySelectorAll(".otp-input");
const form = document.getElementById("otpForm");
const errorBox = document.getElementById("otpError");
const resendBtn = document.getElementById("resendBtn");
const timerText = document.getElementById("timer");

let cooldown = 60;
let timerInterval = null;
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const btn = document.getElementById("verifyBtn");
  const btnText = btn.querySelector(".btn-text");
  const loader = btn.querySelector(".btn-loader");
  const otp = Array.from(inputs)
    .map((i) => i.value)
    .join("");

  const email = localStorage.getItem("pendingEmail");

  if (!email) {
    errorBox.textContent = "Session expired. Please signup again.";
    return; 
  }

  if (otp.length !== 6) {
    errorBox.textContent = "Please enter complete OTP";
    return;
  }

  /* 🔥 ENTER LOADING STATE */
  btn.disabled = true;
  btn.classList.add("loading");
  loader.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:3000/changepasswordotp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.Status || "Invalid OTP from frontend");
    }

    localStorage.removeItem("pendingEmail");

    window.location.href =
      "/ChangePasswordOtp.html";

  } catch (err) {
    errorBox.textContent = err.message || "Server error. Try again.";

    /* 🔥 RESET STATE */
    btn.disabled = false;
    btn.classList.remove("loading");
    loader.classList.add("hidden");
  }
});



resendBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const email = localStorage.getItem("pendingEmail");
  if (!email) {
    errorBox.textContent = "Session expired. Please signup again.";
    return;
  }
  try {
    const res = await fetch("http://localhost:3000/re-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.Status;
      resendBtn.disabled = true;
      return;
    }

    startCooldown();
    alert("OTP resent successfully!");
  } catch (err) {
    errorBox.textContent = "Server error. Try again.";
  }
});


function startCooldown() {
  resendBtn.style.pointerEvents = "none";
  resendBtn.style.opacity = "0.5";
  cooldown = 60;

  timerText.textContent = ` (${cooldown}s)`;

  timerInterval = setInterval(() => {
    cooldown--;
    timerText.textContent = ` (${cooldown}s)`;

    if (cooldown <= 0) {
      clearInterval(timerInterval);
      resendBtn.style.pointerEvents = "auto";
      resendBtn.style.opacity = "1";
      timerText.textContent = "";
    }
  }, 1000);
}
