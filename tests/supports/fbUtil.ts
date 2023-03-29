import { db } from "./fbAdmin";

export const deleteCollection = async (
  collectionName: string,
  subCollectionName?: string
) => {
  const collectionRef = db.collection(collectionName);
  const qs = await collectionRef.get();
  await Promise.all(
    qs.docs.map(async (x) => {
      if (subCollectionName) {
        await deleteCollection(
          `${collectionName}/${x.id}/${subCollectionName}`
        );
      }
      await x.ref.delete();
    })
  );
};
