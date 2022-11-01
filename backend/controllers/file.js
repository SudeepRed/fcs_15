import dotenv from "dotenv";
import Cryptr from "cryptr";
dotenv.config();
const cryptr = new Cryptr(process.env.FILE_SECRET);
export function encryptFile(obj) {
  const encryptedData = cryptr.encrypt(obj);
  return encryptedData;
}
export function decryptFile(encryptedData) {
  return cryptr.decrypt(encryptedData);
}
