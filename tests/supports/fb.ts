import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

initializeApp({ projectId: "swr-firestore-project" });
const db = getFirestore();
const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080").split(":");
connectFirestoreEmulator(db, host, Number(port));

export { db };
