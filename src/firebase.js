// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUnPj-hUAP-r8Uwh7i9AVC4k49wvcQw48",
  authDomain: "chathub-656d6.firebaseapp.com",
  projectId: "chathub-656d6",
  storageBucket: "chathub-656d6.appspot.com",
  messagingSenderId: "95595363401",
  appId: "1:95595363401:web:6efa6c4e64f589377f1398"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app