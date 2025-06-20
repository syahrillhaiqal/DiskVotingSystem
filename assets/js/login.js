const BASE_URL = "https://diskvotingsystem-production.up.railway.app";
const BASE_URL1 = "http://localhost:5000"; //test locally

// Admin authentication form
document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const password = document.getElementById("adminPassword").value;
        const loginBtn = document.getElementById("loginBtn");
        const btnText = loginBtn.querySelector(".btn-text");
        const errorMessage = document.getElementById("errorMessage");
        const errorText = document.getElementById("errorText");

        // Show loading state
        btnText.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';
        loginBtn.disabled = true;
        errorMessage.classList.add("hidden");

        try {
            const response = await fetch(`${BASE_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success - redirect to dashboard
                btnText.innerHTML =
                    '<i class="fas fa-check mr-2"></i>Access Granted';
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                // Show error
                errorText.textContent =
                    data.error || "Invalid password. Please try again.";
                errorMessage.classList.remove("hidden");
                btnText.textContent = "Access Dashboard";
                loginBtn.disabled = false;

                // Clear password field
                document.getElementById("adminPassword").value = "";
                document.getElementById("adminPassword").focus();
            }
        } catch (error) {
            console.error("Login error:", error);
            errorText.textContent = "Connection error. Please try again.";
            errorMessage.classList.remove("hidden");
            btnText.textContent = "Access Dashboard";
            loginBtn.disabled = false;
        }
    });

// Add some security features
document.addEventListener("keydown", function (e) {
    // Prevent F12, Ctrl+Shift+I, Ctrl+U (common dev tools shortcuts)
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u")
    ) {
        e.preventDefault();
        return false;
    }
});

// Disable right-click context menu
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
});
