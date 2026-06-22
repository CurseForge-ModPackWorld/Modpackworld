import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA1PnT7iY6FkPC6anLUXeoxOS1rvS276Co",
  authDomain: "modpackworld-b07b6.firebaseapp.com",
  databaseURL: "https://modpackworld-b07b6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "modpackworld-b07b6",
  storageBucket: "modpackworld-b07b6.firebasestorage.app",
  messagingSenderId: "796261683071",
  appId: "1:796261683071:web:8c7d39d3b99087e20bd44a",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, onValue, set, update, get };
