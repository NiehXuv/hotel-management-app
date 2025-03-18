import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDsBdeguzPtnWxnnHpAp8p0k75RrgoPaUM",
  authDomain: "booking-app-e197c.firebaseapp.com",
  databaseURL: "https://booking-app-e197c-default-rtdb.firebaseio.com",
  projectId: "booking-app-e197c",
  storageBucket: "booking-app-e197c.firebasestorage.app",
  messagingSenderId: "502599979186",
  appId: "1:502599979186:web:3e0726b613fc68d66a39ab",
  measurementId: "G-4EHVX7K143"
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

export { firebaseApp, database };