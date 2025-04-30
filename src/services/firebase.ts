import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDsCHC4Sk5kbgWVm2puf5HWHw_wkV0L4BU",
  authDomain: "furia-34ef2.firebaseapp.com",
  projectId: "furia-34ef2",
  storageBucket: "furia-34ef2.firebasestorage.app",
  messagingSenderId: "139359614113",
  appId: "1:139359614113:web:83d70c348c5b2a200c2ce0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Configurar Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erro ao configurar persistência:", error);
  });

// Configurar Firestore
export const db = getFirestore(app);

export default app; 