import dotenv from "dotenv";
import Cryptr from "cryptr";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";
dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../db/uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuid() + ext;

    // or
    // uuid, or fieldname
    cb(null, filename);
  },
});
const cryptr = new Cryptr(process.env.FILE_SECRET);
export function encryptFile(obj) {
  const encryptedData = cryptr.encrypt(obj);
  return encryptedData;
}
export function decryptFile(encryptedData) {
  return cryptr.decrypt(encryptedData);
}

const uploadPOI = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb("Only .png, .jpg and .jpeg format allowed as POI!");
    }
  },
});



export function uploadFile(req, res, next) {
    const checkPOI = uploadPOI.single('upload');

    checkPOI(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log(err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log(err)
        }
        // Everything went fine. 
        console.log(req)
        res.locals.file = req.file;
        next()
    })
}
