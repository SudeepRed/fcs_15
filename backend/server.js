import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as auth from "./controllers/basicAuth.js";
import * as file from "./controllers/file.js";
import session from "express-session";
import * as role from "./constants/role.js";
import * as roleAuth from "./controllers/role.js";
import * as otp from "./controllers/otpAuth.js";
import * as user from "./apis/user.js";
import * as admin from "./apis/admin.js";
import { v4 as uuid } from "uuid";
import multer from "multer";
import path from "path";
import fs from "fs";
import zip from "express-zip";
import * as IPFS from "ipfs-core";
import * as logs from "logger";
import rateLimit from "express-rate-limit";
import * as requestIp from "request-ip";
let logger = logs.createLogger("Bhamlo.log");

const limiter = rateLimit({
  windowMs: 1000*60*15, // 15 minutes
  max: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  keyGenerator: (req, res) => {
    console.log(req.clientIp)
    logger.info("IP ratelimited: "+ req.clientIp)
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./db/uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = uuid() + ext;

    // or
    // uuid, or fieldname
    cb(null, filename);
  },
});
const uploadAndVerify = multer({
  storage: storage,
  limits: { fileSize: 1e7 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb("Only .png, .jpg, .jpeg and .pdf format allowed!");
    }
  },
});

const uploadPOI = multer({
  storage: storage,
  limits: { fileSize: 1e7 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb("Only .png, .jpg, .jpeg and .pdf format allowed!");
    }
  },
});
dotenv.config();
const app = express();
app.use(requestIp.mw());
app.use(limiter);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("db"));
app.use(express.static("public"));
app.set("view-engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/user", user.router);
app.use("/admin", admin.router);

app.get(
  "/health",
  auth.checkAuth,
  roleAuth.roleCheck([role.USER_ROLE.ADMIN]),
  (req, res) => {
    res.render("health.ejs");
  }
);
app.get("/", auth.checkAuth, (req, res) => {
  res.render("index.ejs", { data: req.session.data });
});
app.get("/login", auth.checkNotAuth, (req, res) => {
  res.render("login.ejs");
});
app.post("/login", auth.checkNotAuth, auth.validateUser, async (req, res) => {
  return res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register.ejs", {
    message: "",
  });
});

const checkUserPOIUpload = uploadPOI.single("upload");
app.post("/registeruser", auth.checkNotAuth, async (req, res) => {
  checkUserPOIUpload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.send(err.message + " Should be less than 10mb");
      console.log(err);

      logger.error(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send("An unknown error occurred");
      console.log(err);

      logger.error(err);
    }

    // Everything went fine.

    if (req.body.getOtp != undefined && req.body.register == undefined) {
      fs.unlink("./db/uploads/" + req.file.filename, (err) => {
        if (err) {
          res.send("Oops! something went wrong!");
        }
        console.log("deleted for otp");
        logger.info("Uploaded File deleted for otp");
      });
      otp.sendMail(req.body.email);
      return false;
    }

    if (req.body.register != undefined && req.body.getOtp == undefined) {
      if (otp.verifyOtp(req.body.otp)) {
        try {
          if (
            req.body.role == role.USER_ROLE.PATIENT ||
            req.body.role == role.USER_ROLE.PROFESSIONAL
          ) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const id = Date.now() + Math.floor(Math.random() * 100000);
            const user = {
              id: id,
              name: req.body.name,
              email: req.body.email,
              password: hashedPassword,
              age: req.body.age || 0,
              role: req.body.role,
            };
            await db.createUser(user);
            await db.insertPOI(id, req.file.filename, "user");
            res.redirect("/login");
          } else {
            return res.render("register.ejs", {
              message: "Role can only be patient or professional",
            });
          }
        } catch (err) {
          console.log(err);
          logger.error(err);

          return res.render("register.ejs", {
            message: "Something went wrong. Please try again.",
          });
        }
      } else {
        return res.render("register.ejs", {
          message: "Please enter the correct otp",
        });
      }
    }
  });
});

const checkOrgPOIUpload = uploadPOI.array("org", 3);
app.post("/registerorg", auth.checkNotAuth, async (req, res) => {
  checkOrgPOIUpload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.send(err.message + " Should be less than 10mb");
      console.log(err);

      logger.error(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send("An unknown error occurred");
      console.log(err);

      logger.error(err);
    }
    if (req.files.length < 2) {
      req.files.forEach((file) => {
        fs.unlink("./db/uploads/" + file.filename, (err) => {
          if (err) {
            res.send("Oops! something went wrong!");
          }
          console.log("Uploaded File deleted for org, min 2 files required");
          logger.info("Uploaded File deleted for org, min 2 files required");
        });
      });

      return res.status(400).json({ error: "Minimum of 2 img is required" });
    }

    if (req.body.getOtp != undefined && req.body.register == undefined) {
      otp.sendMail(req.body.domain);
      return;
    }
    if (req.body.register != undefined && req.body.getOtp == undefined) {
      if (otp.verifyOtp(req.body.otp)) {
        try {
          {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            if (
              req.body.role == role.ORG_ROLE.HOSPITAL ||
              req.body.role == role.ORG_ROLE.PHARMACY ||
              req.body.role == role.ORG_ROLE.INSURANCE
            ) {
              const id = Date.now() + Math.floor(Math.random() * 100000);
              const org = {
                id: id,
                name: req.body.name,
                domain: req.body.domain,
                role: req.body.role,
                password: hashedPassword,
                location: req.body.location,
                description: req.body.description,
                contactDetails: req.body.contactDetails,
              };
              await db.createOrg(org);

              req.files.forEach(async (file) => {
                await db.insertPOI(id, file.filename, "org");
              });
              // await db.insertPOI(id, req.file.filename, "user");
              res.redirect("/login");
            } else {
              logger.error("Wrong ORG_ROLE!");
              return res.render("register.ejs", {
                message: "Wrong ROLE!",
              });
            }
          }
        } catch (err) {
          console.log(err);
          logger.error(err);
          req.files.forEach((file) => {
            fs.unlink("./db/uploads/" + file.filename, (err) => {
              try {
                if (err) {
                  res.send("Oops! something went wrong!");
                }
                console.log(
                  "Uploaded File deleted for org, min 2 files required"
                );
                logger.info(
                  "Uploaded 1 File deleted for org, min 2 files required"
                );
              } catch (err) {
                console.log(
                  "Uploaded File deleted for org, min 2 files required"
                );
                logger.error(err);
              }
            });
          });
          return res.render("register.ejs", {
            message: "Something went wrong. Please try again.",
          });
        }
      } else {
        logger.error("Wrong ORG OTP!");
        return res.render("register.ejs", {
          message: "Please enter the correct otp",
        });
      }
    }
  });
});

app.get("/getmyfiles", auth.checkAuth, async (req, res) => {
  try {
    const type = req.session.data.user.type;
    const myFiles = await db.getMyfiles(type, req.session.data.user.id);
    let files = [];
    const dir = "./db/uploads/";
    myFiles.forEach((file) => {
      if (fs.existsSync(dir + file.filename)) {
        files.push({
          name: file.filename,
        });
      }
    });
    if (files.length == 0) {
      return res.send("Oops! Seems like there are no documents");
    }
    return res.json(files);
  } catch (err) {
    console.log(err);
    logger.error(err);

    res.send("failed to get myfiles");
  }
});
app.post("/download", auth.checkAuth, async (req, res) => {
  try {
    const type = req.session.data.user.type;
    const myFiles = await db.getMyfiles(type, req.session.data.user.id);
    let files = [];
    const dir = "./db/uploads/";
    myFiles.forEach((file) => {
      if (fs.existsSync(dir + file.filename)) {
        files.push({
          path: dir + file.filename,
          name: file.filename,
        });
      }
    });
    if (files.length == 0) {
      return res.send("Oops! Seems like there are no documents");
    }
    const zipFilename =
      "Bhamlo_My_Files_" + req.session.data.user.name.toString() + ".zip";
    return res.zip(files, zipFilename);
  } catch (err) {
    console.log(err);
    logger.error(err);

    res.send("failed to get myfiles");
  }
});
app.post(
  "/deletefile",
  auth.checkAuth,

  async (req, res) => {
    try {
      const type = req.session.data.user.type;
      const result = await db.deleteMyFile(type, req.body.name);
      if (result.status == "done") {
        const dir = "./db/uploads/" + req.body.name;
        fs.unlinkSync(dir);
      }
      return res.send("deleted");
    } catch (err) {
      logger.error(err);
    }
  }
);
app.post(
  "/share",
  auth.checkAuth,
  uploadAndVerify.single("upload"),
  async (req, res) => {
    try {
      if (req.session.data.user.role == "patient") {
        let hash = "NA";
        const ipfs = await IPFS.create();
        const data = fs.readFileSync("./db/uploads/" + req.file.filename);
        hash = await ipfs.add(data);
        const resStop = await ipfs.stop();
        console.log(resStop);
        const verify = await db.verifyHash(hash.path);
        if (!verify) {
          fs.unlink("./db/uploads/" + req.file.filename, (err) => {
            if (err) {
              res.send("Oops! something went wrong!");
            }
            console.log("Deleted Un-Verified File");
            logger.info("Deleted Un-Verified File");
          });
          return res.send("You have attempted to upload an unverified file!");
        }
      }
      let hash = "NA";
      const ipfs = await IPFS.create();
      const data = fs.readFileSync("./db/uploads/" + req.file.filename);
      hash = await ipfs.add(data);
      const ipfsStop = await ipfs.stop();

      let result = await db.insertFile(
        req.session.data.user.type,
        req.session.data.user.id,
        req.file.filename,
        hash.path
      );

      if (req.body.rid) {
        const Stype = req.session.data.user.type;
        const Rtype = req.body.type;
        const sid = req.session.data.user.id;
        result = await db.shareFile(
          Stype,
          Rtype,
          sid,
          req.body.rid,
          req.file.filename,
          hash.path
        );
      }
      return res.json({ status: "success" });
    } catch (err) {
      console.log(err);

      logger.error(err);
      return res.json({ error: "An error Occured" });
    }
  }
);

app.get(
  "/getFiles",
  auth.checkAuth,
  roleAuth.roleCheck([
    role.USER_ROLE.PROFESSIONAL,
    role.USER_ROLE.PATIENT,
    role.ORG_ROLE.HOSPITAL,
  ]),
  async (req, res) => {
    try {
      const receiverID = req.session.data.user.id;
      const sharedFiles = await db.getFiles(receiverID);

      let files = [];
      const dir = "./db/uploads/";
      sharedFiles.forEach((file) => {
        if (fs.existsSync(dir + file.filename)) {
          files.push({
            path: dir + file.filename,
            name: file.filename,
          });
        }
      });
      if (files.length == 0) {
        return res.send("Oops! Seems like there are no documents");
      }
      const zipFilename =
        "Bhamlo_Shared_Files_" + req.session.data.user.name.toString() + ".zip";
      return res.zip(files, zipFilename);
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
app.post(
  "/upload",
  auth.checkAuth,
  roleAuth.roleCheck([role.USER_ROLE.PATIENT]),
  uploadAndVerify.single("upload"),
  async (req, res) => {
    try {
      let hash = "NA";
      const ipfs = await IPFS.create();
      const data = fs.readFileSync("./db/uploads/" + req.file.filename);
      hash = await ipfs.add(data);
      const ipfsStop = await ipfs.stop();

      let result = await db.insertFile(
        req.session.data.user.type,
        req.session.data.user.id,
        req.file.filename,
        hash.path
      );

      return res.json({ status: "success" });
    } catch (err) {
      console.log(err);
      logger.error(err);

      return res.json({ error: "An error Occured" });
    }
  }
);

app.post("/logout", auth.checkAuth, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.listen(process.env.PORT, () => {
  console.log("Server Started");
  logger.info("Server Started");
});

createDB();
