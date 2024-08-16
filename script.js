const signUpButton=document.getElementById('signUp');
const signInButton=document.getElementById('signIn');
const container=document.getElementById('container');

signUpButton.addEventListener('click',()=>{
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click',()=>{
    container.classList.remove("right-panel-active");
});


function handleGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',  // Replace with your Google Client ID
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt();  // Show the Google Sign-In prompt
}

function handleCredentialResponse(response) {
    // Send the response.credential to your server to check if the account exists
    fetch('/api/check-google-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_token: response.credential })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            // If account exists, log the user in
            document.getElementById("account-info").innerText = `Account already registered. Welcome back!`;
        } else {
            // If account doesn't exist, register the user
            document.getElementById("account-info").innerText = `No account found. Registering new account...`;
            registerNewAccount(response.credential);
        }
    })
    .catch(error => console.error('Error:', error));
}

function registerNewAccount(idToken) {
    // Send the idToken to your server to register the new account
    fetch('/api/register-google-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_token: idToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("account-info").innerText = `Account registered successfully. Welcome!`;
        } else {
            document.getElementById("account-info").innerText = `Failed to register account. Please try again.`;
        }
    })
    .catch(error => console.error('Error:', error));
}


window.fbAsyncInit = function() {
    FB.init({
        appId      : 'YOUR_APP_ID',   // Replace with your Facebook App ID
        cookie     : true,             // Enable cookies to allow the server to access the session
        xfbml      : true,             // Parse social plugins on this webpage
        version    : 'v17.0'           // Use this Graph API version for this call
    });
    
    FB.AppEvents.logPageView();        // Log a page view event
};

function handleFacebookLogin() {
    FB.login(function(response) {
        if (response.authResponse) {
            // User is signed in, get user details
            FB.api('/me', { fields: 'name,email' }, function(response) {
                checkFacebookAccount(response);
            });
        } else {
            // User cancelled the login or did not fully authorize
            document.getElementById("account-info").innerText = `Login was unsuccessful. Please try again.`;
        }
    }, { scope: 'public_profile,email' });
}

function checkFacebookAccount(user) {
    // Send the user's Facebook ID or email to your server to check if the account exists
    fetch('/api/check-facebook-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ facebookId: user.id, email: user.email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            // If account exists, log the user in
            document.getElementById("account-info").innerText = `Account already registered. Welcome back, ${user.name}!`;
        } else {
            // If account doesn't exist, register the user
            document.getElementById("account-info").innerText = `No account found. Registering new account...`;
            registerNewFacebookAccount(user);
        }
    })
    .catch(error => console.error('Error:', error));
}

function registerNewFacebookAccount(user) {
    // Send the user's details to your server to register the new account
    fetch('/api/register-facebook-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ facebookId: user.id, email: user.email, name: user.name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("account-info").innerText = `Account registered successfully. Welcome, ${user.name}!`;
        } else {
            document.getElementById("account-info").innerText = `Failed to register account. Please try again.`;
        }
    })
    .catch(error => console.error('Error:', error));
}
