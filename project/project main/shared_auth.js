// shared_auth.js - Handles authentication state across all pages
import { 
    auth, 
    onAuthStateChanged,
    signOut
} from "./userAuthentication.js";

document.addEventListener('DOMContentLoaded', function() {
    // Get the register button and profile popup elements
    const registerBtn = document.getElementById('registerBtn');
    const profilePopup = document.getElementById('profilePopup');
    const closeProfilePopup = document.getElementById('closeProfilePopup');
    const loginPopup = document.getElementById('loginPopup');
    const closePopup = document.getElementById('closePopup');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check authentication state on page load
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            updateUIForLoggedInUser(user);
        } else {
            // User is signed out
            updateUIForLoggedOutUser();
        }
    });
    
    // Update UI based on login state
    function updateUIForLoggedInUser(user) {
        if (registerBtn) {
            registerBtn.textContent = user.displayName || "Profile";
            registerBtn.classList.add('profile-active');
        }
        
        // Update profile information if popup exists
        if (profilePopup) {
            const profileUsername = document.getElementById('profileUsername');
            const profileEmail = document.getElementById('profileEmail');
            
            if (profileUsername) profileUsername.textContent = user.displayName || "Not set";
            if (profileEmail) profileEmail.textContent = user.email || "Not available";
        }
    }
    
    function updateUIForLoggedOutUser() {
        if (registerBtn) {
            registerBtn.textContent = "Register";
            registerBtn.classList.remove('profile-active');
        }
    }
    
    // Add event listeners if elements exist
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            if (auth.currentUser) {
                // If user is logged in, show profile popup
                if (profilePopup) profilePopup.style.display = 'flex';
            } else {
                // If user is not logged in, show login popup
                if (loginPopup) loginPopup.style.display = 'flex';
            }
        });
    }

    // Close buttons for popups
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            loginPopup.style.display = 'none';
        });
    }

    if (closeProfilePopup) {
        closeProfilePopup.addEventListener('click', function() {
            profilePopup.style.display = 'none';
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            signOut(auth).then(() => {
                // Sign-out successful
                alert("You have been logged out");
                if (profilePopup) profilePopup.style.display = 'none';
            }).catch((error) => {
                // An error happened
                alert("Error logging out: " + error.message);
            });
        });
    }
});