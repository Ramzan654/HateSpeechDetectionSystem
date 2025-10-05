document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("registerBtn");
    const loginPopup = document.getElementById("loginPopup");
    const closePopup = document.getElementById("closePopup");

    // Show popup when clicking Register
    registerBtn.addEventListener("click", function () {
        loginPopup.style.display = "flex";
    });

    // Hide popup when clicking the close button
    closePopup.addEventListener("click", function () {
        loginPopup.style.display = "none";
    });

    // Hide popup when clicking outside the content
    window.addEventListener("click", function (event) {
        if (event.target === loginPopup) {
            loginPopup.style.display = "none";
        }
    });
});
