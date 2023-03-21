import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./fb";

export const deleteCollection = async (collectionName: string, subCollectionName?: string) => {
  const collectionRef = collection(db, collectionName);
  const qs = await getDocs(collectionRef);
  await Promise.all(qs.docs.map(async (x) => {
    console.log({ id: x.id, collectionName, subCollectionName });
    if (subCollectionName) {
      await deleteCollection(`${collectionName}/${x.id}/${subCollectionName}`);
    }
    await deleteDoc(x.ref);
  }));
};