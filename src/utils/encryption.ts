// utils/encryption.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = "my-secret-key";

export const encryptPayload = (data: any): string => {
  const stringified = JSON.stringify(data);
  return CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
};

export const decryptPayload = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};
