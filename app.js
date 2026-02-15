// app.js

// 1) Imports Firebase depuis les CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2) Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkmJDIInh98V5KDXNwX7Y7nYlsCLkvuis",
  authDomain: "mini-challenge-firebase-cacd5.firebaseapp.com",
  projectId: "mini-challenge-firebase-cacd5",
  storageBucket: "mini-challenge-firebase-cacd5.firebasestorage.app",
  messagingSenderId: "306580970959",
  appId: "1:306580970959:web:dd27cb28ebe812f24546ba",
  measurementId: "G-6BD9M8G6L5"
};

// 3) Initialiser Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // optionnel si Analytics n'est pas activé
const auth = getAuth(app);
const db = getFirestore(app);

// === AUTH (Hichem) ===
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const postSection = document.getElementById("post-section");

// Inscription
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Compte créé !");
    signupForm.reset();
  } catch (error) {
    alert("Erreur inscription : " + error.message);
  }
});

// Connexion
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Connecté !");
    loginForm.reset();
  } catch (error) {
    alert("Erreur connexion : " + error.message);
  }
});

// Déconnexion
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Déconnecté !");
  } catch (error) {
    alert("Erreur déconnexion : " + error.message);
  }
});

// État de connexion (montre / cache la zone de publication)
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `Connecté en tant que ${user.email}`;
    logoutBtn.style.display = "inline-block";
    postSection.style.display = "block";
  } else {
    userInfo.textContent = "Non connecté";
    logoutBtn.style.display = "none";
    postSection.style.display = "none";
  }
});

// === PARTIE PUBLICATION ===

// Récupérer les éléments du formulaire
const postForm = document.getElementById("post-form");
const postContentInput = document.getElementById("post-content");

// Référence à la collection "messages"
const messagesColRef = collection(db, "messages");

// Gestion de la soumission du formulaire
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Vérifier que l'utilisateur est connecté
  const user = auth.currentUser;
  if (!user) {
    alert("Vous devez être connecté pour publier.");
    return;
  }

  // Récupérer le texte du message
  const contenu = postContentInput.value.trim();
  if (!contenu) return;

  try {
    // Ajouter un document dans "messages"
    await addDoc(messagesColRef, {
      contenu: contenu,
      uid: user.uid,
      email: user.email,
      timestamp: serverTimestamp()
    });

    // Vider le formulaire
    postForm.reset();
  } catch (error) {
    alert("Erreur publication : " + error.message);
  }
});

// === PARTIE AFFICHAGE ===

// Zone où afficher les messages
const messagesList = document.getElementById("messages-list");

// Requête pour lire les messages triés par date (plus récent d'abord)
const messagesQuery = query(messagesColRef, orderBy("timestamp", "desc"));

// Écoute en temps réel des messages
onSnapshot(messagesQuery, (snapshot) => {
  // Vider la liste avant de la reconstruire
  messagesList.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    // Gérer la date (peut être undefined si serverTimestamp pas encore résolu)
    const date = data.timestamp?.toDate
      ? data.timestamp.toDate().toLocaleString()
      : "Date inconnue";

    // Créer un bloc HTML pour chaque message
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${data.email}</strong> : ${data.contenu}</p>
      <small>${date}</small>
      <hr>
    `;

    messagesList.appendChild(div);
  });
});
