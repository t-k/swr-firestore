import {
  CollectionReference,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../supports/fb";
import type { Post } from "../supports/model";
import { faker } from "@faker-js/faker";
import { deleteCollection } from "../supports/fbUtil";
import { getDoc } from "../../src/server";
import { Timestamp } from "firebase-admin/firestore";
import { unstable_serialize } from "swr";

const COLLECTION = "GetDocTest";
describe("getDoc", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
  });
  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { key, data } = await getDoc<Post>({ path: `${COLLECTION}/${id}` });
      expect(data != null).toBe(true);
      expect(data?.id).toBeDefined();
      expect(data?.exists).toBeDefined();
      expect(data?.ref).toBeDefined();
      expect(data?.status).toBe("draft");
      expect(data?.content).toBe("hello");
      expect(data?.createdAt instanceof Timestamp).toBe(true);
    });
  });
  describe("with isSubscription option", () => {
    it("should return key with subscription prefix", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { key, data } = await getDoc<Comment>({
        path: `${COLLECTION}/${id}`,
        isSubscription: true,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual(
        "$sub$" + unstable_serialize({ path: `${COLLECTION}/${id}` })
      );
    });
  });
  describe("parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { key, data } = await getDoc<Post>({
        path: `${COLLECTION}/${id}`,
        parseDates: ["createdAt"],
      });
      expect(data != null).toBe(true);
      expect(data?.createdAt instanceof Date).toBe(true);
    });
  });
  describe("with nested object", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
        author: {
          name: "John",
          createdAt: serverTimestamp(),
        },
      });
      const { key, data } = await getDoc<Post>({
        path: `${COLLECTION}/${id}`,
        parseDates: ["createdAt", "author.createdAt"],
      });
      expect(data != null).toBe(true);
      expect(data?.createdAt instanceof Date).toBe(true);
      expect(data?.author?.createdAt instanceof Date).toBe(true);
    });
  });
});
