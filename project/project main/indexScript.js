// This JavaScript should be added to your indexScript.js file
import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "./userAuthentication.js";

document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const initialScreen = document.getElementById('initial-screen');
    const processingScreen = document.getElementById('processing-screen');
    const resultsScreen = document.getElementById('results-screen');
    const reportScreen = document.getElementById('report-screen');
    
    const youtubeLink = document.getElementById('youtube-link');
    const modelSelect = document.getElementById('model');
    const clearBtn = document.getElementById('clear-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const reportBtn = document.getElementById('report-btn');
    const backToHome = document.getElementById('back-to-home');
    const backToResults = document.getElementById('back-to-results');
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const pieChart = document.getElementById('pie-chart');  
    const hatePercentageDisplay = document.getElementById('hate-percentage');
    const analyzedCommentsTableBody = document.querySelector('#analyzed-comments-table tbody');
    
    // Get the register button and popup elements
    const registerBtn = document.getElementById('registerBtn');
    const loginPopup = document.getElementById('loginPopup');
    const profilePopup = document.getElementById('profilePopup');
    const closePopup = document.getElementById('closePopup');
    const closeProfilePopup = document.getElementById('closeProfilePopup');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Authentication state
    let currentUser = null;
    
    // Check authentication state on load
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            updateUIForLoggedInUser(user);
        } else {
            // User is signed out
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
    
    // Update UI based on login state
    function updateUIForLoggedInUser(user) {
        registerBtn.textContent = user.displayName || "Profile";
        registerBtn.classList.add('profile-active');
        
        // Update profile information
        if (profilePopup) {
            document.getElementById('profileUsername').textContent = user.displayName || "Not set";
            document.getElementById('profileEmail').textContent = user.email || "Not available";
        }
    }
    
    function updateUIForLoggedOutUser() {
        registerBtn.textContent = "Register";
        registerBtn.classList.remove('profile-active');
    }
    
    // YouTube URL validation function
    function isValidYouTubeUrl(url) {
        const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
        return pattern.test(url);
    }
    
    // Function to extract video ID from YouTube URL
    function extractVideoId(url) {
        const pattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(pattern);
        return (match && match[1]) ? match[1] : null;
    }
    
    // Event listeners
    clearBtn.addEventListener('click', function() {
        youtubeLink.value = '';
    });
    
    // FIXED ANALYZE BUTTON - Properly synced with backend progress
    analyzeBtn.addEventListener('click', async function() {
        // Check if user is logged in before proceeding
        if (!currentUser) {
            loginPopup.style.display = 'flex';
            return;
        }
        
        const url = youtubeLink.value.trim();
        if (url === '') {
            alert('Please enter a YouTube link');
            return;
        }
        
        if (!isValidYouTubeUrl(url)) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        
        const selectedModel = modelSelect.value;
        
        // Show processing screen and reset progress
        initialScreen.style.display = 'none';
        processingScreen.style.display = 'flex';
        progressFill.style.width = '0%';
        progressText.innerText = '0%';
        
        try {
            // Start analysis task
            const startResponse = await fetch("http://127.0.0.1:5000/start-analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: url,
                    model: selectedModel
                })
            });
            
            if (!startResponse.ok) {
                throw new Error(`HTTP error! status: ${startResponse.status}`);
            }
            
            const startData = await startResponse.json();
            const taskId = startData.task_id;
            
            // Function to check progress - this is the key fix
            const checkProgress = async () => {
                try {
                    const progressResponse = await fetch(`http://127.0.0.1:5000/progress/${taskId}`);
                    
                    if (!progressResponse.ok) {
                        throw new Error(`Progress check failed: ${progressResponse.status}`);
                    }
                    
                    const progressData = await progressResponse.json();
                    console.log('Progress data:', progressData); // Debug log
                    
                    const progress = progressData.progress;
                    const total = progressData.total || 0;
                    
                    // Update progress display with actual backend progress
                    progressFill.style.width = progress + '%';
                    progressText.innerText = `${progress}% ${total > 0 ? `(${Math.floor((progress/100) * total)}/${total} comments)` : ''}`;
                    
                    if (progress === 100) {
                        // Analysis complete, get results
                        const resultsResponse = await fetch(`http://127.0.0.1:5000/results/${taskId}`);
                        
                        if (!resultsResponse.ok) {
                            throw new Error(`Results fetch failed: ${resultsResponse.status}`);
                        }
                        
                        const result = await resultsResponse.json();
                        console.log('Results:', result); // Debug log
                        
                        // Store data for UI
                        window.analysisData = {
                            channelName: result.channel_name,
                            totalComments: result.total,
                            hatePercentage: result.hate_percentage,
                            nonHatePercentage: result.non_hate_percentage,
                            analyzedComments: result.analyzed_comments || [] // Store analyzed comments
                        };
                        
                        // Show results screen
                        setTimeout(() => {
                            processingScreen.style.display = 'none';
                            resultsScreen.style.display = 'block';
                            
                            // Update results display
                            hatePercentageDisplay.innerHTML = 
                                `Hate: <strong>${result.hate_percentage.toFixed(1)}%</strong>, Non-Hate: <strong>${result.non_hate_percentage.toFixed(1)}%</strong>`;
                        }, 500);
                    } 
                    else if (progress === -1) {
                        // Error occurred
                        const errorMsg = progressData.error || "Analysis failed";
                        // Using a simple message box instead of alert()
                        const errorMessageDiv = document.createElement('div');
                        errorMessageDiv.classList.add('message-box');
                        errorMessageDiv.innerHTML = `<p>${errorMsg}</p><button onclick="this.parentNode.remove()">Close</button>`;
                        document.body.appendChild(errorMessageDiv);
                        processingScreen.style.display = 'none';
                        initialScreen.style.display = 'block';
                    } 
                    else {
                        // Continue polling - reduced interval for smoother updates
                        setTimeout(checkProgress, 250); // Poll every 250ms for smoother progress
                    }
                } catch (error) {
                    console.error("Progress check error:", error);
                    const errorMessageDiv = document.createElement('div');
                    errorMessageDiv.classList.add('message-box');
                    errorMessageDiv.innerHTML = `<p>Error during analysis: ${error.message}</p><button onclick="this.parentNode.remove()">Close</button>`;
                    document.body.appendChild(errorMessageDiv);
                    processingScreen.style.display = 'none';
                    initialScreen.style.display = 'block';
                }
            };
            
            // Start progress checking immediately
            setTimeout(checkProgress, 500); // Small delay to let backend initialize
            
        } catch (error) {
            console.error("Analysis start error:", error);
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.classList.add('message-box');
            errorMessageDiv.innerHTML = `<p>Failed to start analysis: ${error.message}</p><button onclick="this.parentNode.remove()">Close</button>`;
            document.body.appendChild(errorMessageDiv);
            processingScreen.style.display = 'none';
            initialScreen.style.display = 'block';
        }
    });
    
    reportBtn.addEventListener('click', function() {
        resultsScreen.style.display = 'none';
        reportScreen.style.display = 'block';
        
        // Use the stored analysis data to update the report screen
        const data = window.analysisData;
        
        // Update pie chart with the hate/non-hate percentages
        updatePieChart(data.hatePercentage, data.nonHatePercentage);
        
        // Update the legend percentages
        document.getElementById('hate-legend-percentage').textContent = `${Number(data.hatePercentage).toFixed(1)}%`;
        document.getElementById('non-hate-legend-percentage').textContent = `${Number(data.nonHatePercentage).toFixed(1)}%`;
        
        // Update report data with channel name and comment count
        document.getElementById('channel-name').innerText = 'Channel: ' + data.channelName;
        document.getElementById('comment-count').innerText = 'Total Comments Analyzed: ' + data.totalComments;

        // Populate the analyzed comments table
        populateCommentsTable(data.analyzedComments);
    });
    
    // Function to update pie chart with specific percentages
    function updatePieChart(hatePercentage, nonHatePercentage) {
        // Ensure the percentages add up to 100%
        const totalPercentage = hatePercentage + nonHatePercentage;
        if (totalPercentage !== 100) {
            hatePercentage = (hatePercentage / totalPercentage) * 100;
            nonHatePercentage = (nonHatePercentage / totalPercentage) * 100;
        }
        
        // Apply conic gradient to the pie chart
        pieChart.style.background = `conic-gradient(
            #ff6b6b 0% ${hatePercentage}%, 
            #4ecdc4 ${hatePercentage}%
        )`;
        
        // Update the legend percentages
        const legendItems = document.querySelectorAll('.legend-item span:last-child');
        if (legendItems.length >= 2) {
            legendItems[0].textContent = `${Number(hatePercentage).toFixed(1)}%`;
            legendItems[1].textContent = `${Number(nonHatePercentage).toFixed(1)}%`;
        }
    }

    // Function to populate the comments table
    function populateCommentsTable(comments) {
        analyzedCommentsTableBody.innerHTML = ''; // Clear existing rows
        if (comments && comments.length > 0) {
            comments.forEach(item => {
                const row = analyzedCommentsTableBody.insertRow();
                const commentCell = row.insertCell(0);
                const labelCell = row.insertCell(1);

                commentCell.textContent = item.comment;
                labelCell.textContent = item.label;

                // Add class based on label for styling
                if (item.label === 'Hate') {
                    row.classList.add('hate-comment-row');
                } else {
                    row.classList.add('non-hate-comment-row');
                }
            });
        } else {
            const row = analyzedCommentsTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 2;
            cell.textContent = 'No comments analyzed or available.';
            cell.style.textAlign = 'center';
            cell.style.padding = '10px';
            cell.style.color = '#777';
        }
    }
    
    backToHome.addEventListener('click', function() {
        resultsScreen.style.display = 'none';
        initialScreen.style.display = 'block';
        youtubeLink.value = '';
    });
    
    backToResults.addEventListener('click', function() {
        reportScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
    });

    // Show the appropriate popup when the register/profile button is clicked
    registerBtn.addEventListener('click', function() {
        if (currentUser) {
            // If user is logged in, show profile popup directly
            document.getElementById('profileUsername').textContent = currentUser.displayName || "Not set";
            document.getElementById('profileEmail').textContent = currentUser.email || "Not available";
            profilePopup.style.display = 'flex';
        } else {
            // If user is not logged in, show login popup
            loginPopup.style.display = 'flex';
        }
    });

    // Hide the login popup when the close button is clicked
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            loginPopup.style.display = 'none';
        });
    }

    // Hide the profile popup when the close button is clicked
    if (closeProfilePopup) {
        closeProfilePopup.addEventListener('click', function() {
            profilePopup.style.display = 'none';
        });
    }

    // Handle logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            signOut(auth).then(() => {
                const messageBox = document.createElement('div');
                messageBox.classList.add('message-box');
                messageBox.innerHTML = `<p>You have been logged out</p><button onclick="this.parentNode.remove()">Close</button>`;
                document.body.appendChild(messageBox);
                profilePopup.style.display = 'none';
            }).catch((error) => {
                const messageBox = document.createElement('div');
                messageBox.classList.add('message-box');
                messageBox.innerHTML = `<p>Error logging out: ${error.message}</p><button onclick="this.parentNode.remove()">Close</button>`;
                document.body.appendChild(messageBox);
            });
        });
    }

    // Get all sign-up related elements
    const signUpBtn = document.getElementById('signUpBtn');
    const signInBtn = document.getElementById('signInBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const backToLogin = document.getElementById('backToLogin');
    const leftSection = document.querySelector('.left-section');
    const signupSection = document.getElementById('signupSection');
    const rightSection = document.querySelector('.right-section');

    // Show sign-up form when Sign Up button is clicked
    if (signUpBtn) {
        signUpBtn.addEventListener('click', function() {
            leftSection.style.display = 'none';
            signupSection.style.display = 'block';
            rightSection.style.display = 'none';
        });
    }

    // Show login form when "Sign In" link is clicked
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            leftSection.style.display = 'block';
            signupSection.style.display = 'none';
            rightSection.style.display = 'block';
        });
    }

    // Handle account creation with Firebase
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', function() {
            const email = document.getElementById('signupEmail').value;
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;

            if (!email || !username || !password) {
                const messageBox = document.createElement('div');
                messageBox.classList.add('message-box');
                messageBox.innerHTML = `<p>Please fill in all fields</p><button onclick="this.parentNode.remove()">Close</button>`;
                document.body.appendChild(messageBox);
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    return updateProfile(user, {
                        displayName: username
                    }).then(() => {
                        const messageBox = document.createElement('div');
                        messageBox.classList.add('message-box');
                        messageBox.innerHTML = `<p>Account created successfully! Welcome, ${username}</p><button onclick="this.parentNode.remove()">Close</button>`;
                        document.body.appendChild(messageBox);
                        
                        leftSection.style.display = 'block';
                        signupSection.style.display = 'none';
                        rightSection.style.display = 'block';
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('message-box');
                    if (errorCode === 'auth/email-already-in-use') {
                        messageBox.innerHTML = `<p>Email already in use. Please use a different email or sign in.</p><button onclick="this.parentNode.remove()">Close</button>`;
                    } else if (errorCode === 'auth/weak-password') {
                        messageBox.innerHTML = `<p>Password is too weak. Please use a stronger password.</p><button onclick="this.parentNode.remove()">Close</button>`;
                    } else {
                        messageBox.innerHTML = `<p>Error creating account: ${errorMessage}</p><button onclick="this.parentNode.remove()">Close</button>`;
                    }
                    document.body.appendChild(messageBox);
                });
        });
    }

    // Handle sign in with Firebase
    if (signInBtn) {
        signInBtn.addEventListener('click', function() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                const messageBox = document.createElement('div');
                messageBox.classList.add('message-box');
                messageBox.innerHTML = `<p>Please enter both email and password</p><button onclick="this.parentNode.remove()">Close</button>`;
                document.body.appendChild(messageBox);
                return;
            }

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('message-box');
                    messageBox.innerHTML = `<p>Login successful! Welcome back!</p><button onclick="this.parentNode.remove()">Close</button>`;
                    document.body.appendChild(messageBox);
                    loginPopup.style.display = 'none';
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('message-box');
                    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                        messageBox.innerHTML = `<p>Invalid email or password. Please try again.</p><button onclick="this.parentNode.remove()">Close</button>`;
                    } else {
                        messageBox.innerHTML = `<p>Error signing in: ${errorMessage}</p><button onclick="this.parentNode.remove()">Close</button>`;
                    }
                    document.body.appendChild(messageBox);
                });
        });
    }

    // Forgot password functionality with Firebase
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            if (!email) {
                const messageBox = document.createElement('div');
                messageBox.classList.add('message-box');
                messageBox.innerHTML = `<p>Please enter your email address in the email field</p><button onclick="this.parentNode.remove()">Close</button>`;
                document.body.appendChild(messageBox);
                return;
            }
            
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('message-box');
                    messageBox.innerHTML = `<p>Password reset email sent. Please check your inbox.</p><button onclick="this.parentNode.remove()">Close</button>`;
                    document.body.appendChild(messageBox);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('message-box');
                    if (errorCode === 'auth/user-not-found') {
                        messageBox.innerHTML = `<p>No account found with this email address.</p><button onclick="this.parentNode.remove()">Close</button>`;
                    } else {
                        messageBox.innerHTML = `<p>Error sending password reset: ${errorMessage}</p><button onclick="this.parentNode.remove()">Close</button>`;
                    }
                    document.body.appendChild(messageBox);
                });
        });
    }
});
