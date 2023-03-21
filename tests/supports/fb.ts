import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

initializeApp({ projectId: "swr-firestore-project" });
const db = getFirestore();
connectFirestoreEmulator(db, "localhost", 8080);

export { db };
