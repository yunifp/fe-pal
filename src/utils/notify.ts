// src/lib/notify.ts;
import { db } from "@/lib/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Kirim notifikasi ke user tertentu.
 *
 * @param targetId - ID user yang akan menerima notifikasi
 * @param title - Judul notifikasi
 * @param message - Isi pesan notifikasi
 */
export const sendNotification = async (
  targetId: string,
  title: string,
  message: string
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      targetId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi:", error);
  }
};
