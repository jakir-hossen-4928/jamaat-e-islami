
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDywOV9x9n2OaxG7qGHuv-VPgm0BtbUFIk",
  authDomain: "jamaat-e-islami-fd884.firebaseapp.com",
  projectId: "jamaat-e-islami-fd884",
  storageBucket: "jamaat-e-islami-fd884.firebasestorage.app",
  messagingSenderId: "376583898750",
  appId: "1:376583898750:web:17c4e55eed0cc8e6f0fa2f",
  measurementId: "G-PJJCJL06GL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
