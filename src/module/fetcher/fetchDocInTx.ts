import { doc, getFirestore } from "firebase/firestore";
import type { Transaction } from "firebase/firestore";

import type { DocumentData } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import type { ModuleDocParams } from "../hooks/useDoc";

const fetchDocInTx = async <T>(
  transaction: Transaction,
  params: ModuleDocParams<T>,
): Promise<DocumentData<T> | undefined> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const docRef = doc(db, path).withConverter(converter);
  const snapshot = await transaction.get(docRef);
  return snapshot.data();
};

export default fetchDocInTx;
