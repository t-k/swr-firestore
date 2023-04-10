import { db } from "./fbAdmin";

export const deleteCollection = async (
  collectionName: string,
  subCollectionNames?: string[]
) => {
  const collectionRef = db.collection(collectionName);
  const qs = await collectionRef.get();
  await Promise.all(
    qs.docs.map(async (x) => {
      if (subCollectionNames) {
        await Promise.all(
          subCollectionNames.map(async (sub) => {
            await deleteCollection(`${collectionName}/${x.id}/${sub}`);
          })
        );
      }
      await x.ref.delete();
    })
  );
};
