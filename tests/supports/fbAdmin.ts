import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ projectId: "swr-firestore-project" });
const db = getFirestore();
export { db };
