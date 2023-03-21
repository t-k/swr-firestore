import firebase_tools from "firebase-tools";
export const deleteCollection = async (collectionName: string) => {
  await firebase_tools.firestore.delete(collectionName, {
    project: process.env.GCLOUD_PROJECT,
    recursive: true,
    yes: true,
    force: true,
  });
};
