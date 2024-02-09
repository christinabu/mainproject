// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getDatabase, set, ref, update } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAOIDXLXY2mbGDf3Ef0VGWCxRmO0IB45j4",
    authDomain: "main-project-3f2c1.firebaseapp.com",
    databaseURL: "https://main-project-3f2c1-default-rtdb.firebaseio.com",
    projectId: "main-project-3f2c1",
    storageBucket: "main-project-3f2c1.appspot.com",
    messagingSenderId: "523866098769",
    appId: "1:523866098769:web:3a9530771d2741310e3c70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth();

const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var username = document.getElementById('name').value;

    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.length > 0) {
            // Email already exists
            alert('Email is already in use. Please use a different email.');
        } else {
            // Proceed with the sign-up
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await set(ref(database, 'users/' + user.uid), {
                username: username,
                email: email,
            });

            alert('User Created');
        }
    } catch (error) {
        console.error('Error checking email existence:', error);
        alert('Error during sign-up. Please try again.');
    }
});

signinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    var email = document.getElementById('signin-email').value;
    var password = document.getElementById('signin-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            const dt = new Date();

            update(ref(database, 'users/' + user.uid), {
                last_login: dt,
            });

            alert('User Logged In');

            // Redirect to monitoring.html after successful sign-in
            window.location.href = '/front';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
        });
});
const signoutButton = document.getElementById('signout');

signoutButton.addEventListener('click', (e) => {
    e.preventDefault();

        const auth = getAuth();
        auth.signOut().then(() => {
            alert('User Signed Out');

            // Redirect to the home page after successful sign-out
            window.location.href = '/';
        }).catch((error) => {
            console.error('Error signing out:', error);
            alert('Error during sign-out. Please try again.');
        });
});