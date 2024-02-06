// logout.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

// Firebase configuration
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
const auth = getAuth(app);

// Logout function
function logout() {
    signOut(auth)
        .then(() => {
            console.log("User signed out");
            // Redirect to your logout page or homepage
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
}

export default logout;
