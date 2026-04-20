import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

// --- Houses ---

export const housesCollection = collection(db, "houses");

export const getHouses = async () => {
  const snapshot = await getDocs(query(housesCollection, orderBy("name")));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToHouses = (callback) => {
  const q = query(housesCollection, orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const houses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(houses);
  });
};

export const addHouse = async (house) => {
  return await addDoc(housesCollection, {
    ...house,
    createdAt: serverTimestamp(),
  });
};

export const updateHouse = async (id, data) => {
  const docRef = doc(db, "houses", id);
  return await updateDoc(docRef, data);
};

export const deleteHouse = async (id) => {
  const docRef = doc(db, "houses", id);
  return await deleteDoc(docRef);
};

// --- Students ---

export const studentsCollection = collection(db, "students");

export const getStudents = async () => {
  const snapshot = await getDocs(query(studentsCollection, orderBy("name")));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToStudents = (callback) => {
  const q = query(studentsCollection, orderBy("name"));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(students);
  });
};

export const getStudentsByHouse = async (houseId) => {
  const q = query(
    studentsCollection,
    where("houseId", "==", houseId),
    orderBy("name"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addStudent = async (student) => {
  return await addDoc(studentsCollection, {
    ...student,
    createdAt: serverTimestamp(),
  });
};

export const updateStudent = async (id, data) => {
  const docRef = doc(db, "students", id);
  return await updateDoc(docRef, data);
};

export const deleteStudent = async (id) => {
  const docRef = doc(db, "students", id);
  return await deleteDoc(docRef);
};

// --- Events ---

export const eventsCollection = collection(db, "events");

export const getEvents = async () => {
  const snapshot = await getDocs(
    query(eventsCollection, orderBy("date", "desc")),
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToEvents = (callback) => {
  const q = query(eventsCollection, orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(events);
  });
};

export const addEvent = async (event) => {
  return await addDoc(eventsCollection, {
    ...event,
    createdAt: serverTimestamp(),
  });
};

export const updateEvent = async (id, data) => {
  const docRef = doc(db, "events", id);
  return await updateDoc(docRef, data);
};

export const deleteEvent = async (id) => {
  const docRef = doc(db, "events", id);
  return await deleteDoc(docRef);
};

// --- Point Entries ---

export const pointEntriesCollection = collection(db, "pointEntries");

export const subscribeToPointEntries = (callback) => {
  const q = query(pointEntriesCollection, orderBy("awardedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(entries);
  });
};

export const getRecentPointEntries = async (limitCount) => {
  // Note: We'd normally use limit() here, but keeping it simple for now and filtering client-side if needed
  // or we can add limit to the query if we import it
  const q = query(pointEntriesCollection, orderBy("awardedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .slice(0, limitCount)
    .map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const awardPointsBatch = async (students, event, points, adminEmail) => {
  const batch = writeBatch(db);

  students.forEach((student) => {
    const newEntryRef = doc(pointEntriesCollection);
    batch.set(newEntryRef, {
      studentId: student.id,
      studentName: student.name,
      houseId: student.houseId,
      eventId: event.id,
      eventName: event.name,
      eventCategory: event.category,
      points: points,
      awardedAt: serverTimestamp(),
      awardedBy: adminEmail,
    });
  });

  await batch.commit();
};

// --- Seed Data Helper (for initial setup) ---
export const seedInitialHouses = async () => {
  const defaultHouses = [
    { name: "Trinity", color: "red", iconEmoji: "🦁" }, // Red
    { name: "Corpus Christi", color: "blue", iconEmoji: "🐺" }, /// Blue
    { name: "Peterhouse", color: "yellow", iconEmoji: "🏰" }, // Yellow
    { name: "Wolfson", color: "green", iconEmoji: "🐉" }, // Green
  ];

  const batch = writeBatch(db);
  defaultHouses.forEach((house) => {
    const ref = doc(housesCollection);
    batch.set(ref, { ...house, createdAt: serverTimestamp() });
  });

  await batch.commit();
};
