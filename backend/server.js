import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as auth from "./controllers/basicAuth.js";
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
const upload = multer({
  storage: storage,
  fileFilter: async function (req, file, cb) {
    const ret = await auth.verifyFile(req);
    if (ret == true) {
      req.fileError = false;
    } else {
      req.fileError = true;
    }
    cb(null, ret);
  },
});
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("db"));
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
app.post("/registeruser", auth.checkNotAuth, async (req, res) => {
  if (req.body.getOtp != undefined && req.body.register == undefined) {
    otp.sendMail(req.body.email);
    return;
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
          const user = {
            id: Date.now(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            age: req.body.age || 0,
            role: req.body.role,
          };
          db.createUser(user);
          res.redirect("/login");
        } else {
          return res.render("register.ejs", {
            message: "Role can only be patient or professional",
          });
        }
      } catch (error) {
        console.log(error);
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

app.post("/registerorg", auth.checkNotAuth, async (req, res) => {
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
            const org = {
              id: Date.now(),
              name: req.body.name,
              domain: req.body.domain,
              role: req.body.role,
              password: hashedPassword,
              location: req.body.location,
              description: req.body.description,
              contactDetails: req.body.contactDetails,
            };
            db.createOrg(org);
            res.redirect("/login");
          } else {
            return res.render("register.ejs", {
              message: "Wrong ROLE!",
            });
          }
        }
      } catch (error) {
        console.log(error);
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
app.post("/passphrase", auth.checkAuth, async (req, res) => {
  if (req.body.getOtp != undefined) {
    const email =
      req.session.data.user.email != undefined
        ? req.session.data.user.email
        : req.session.data.user.domain;
    otp.sendMail(email);
    return;
  }
  if (req.body.otp != undefined && req.body.pass != undefined) {
    if (otp.verifyOtp(req.body.otp)) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.pass, salt);
      try {
        const result = await db.updatePassphrase(
          hashedPassword,
          req.session.data.user.type,
          req.session.data.user.id
        );
        res.send("Successfully updated passphrase");
      } catch (error) {
        console.log(error);
      }
    } else {
      res.send("Enter correct otp");
    }
  } else {
    res.send("enter otp/passphrase");
  }
});
app.get("/getmyfiles", auth.checkAuth, async (req, res) => {
  try {
    const type = req.session.data.user.type;
    const myFiles = await db.getMyfiles(type, req.session.data.user.id);

    res.json(myFiles);
  } catch (error) {
    console.log(error);
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
      files.push({
        path: dir + file.filename,
        name: file.filename,
      });
    });
    res.zip(files);
    res.write(JSON.stringify(myFiles));
    res.end();
  } catch (error) {
    console.log(error);
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
      res.send("deleted");
    } catch (e) {
      console.log("e");
    }
  }
);
app.post(
  "/upload",
  auth.checkAuth,
  upload.single("upload"),
  async (req, res) => {
    if (req.fileError) {
      return res.send("WRONG PASSPHRASE!");
    }
    try {
      let result = await db.insertFile(
        req.session.data.user.type,
        req.session.data.user.id,
        req.file.filename
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
          req.file.filename
        );
      }
      return res.json({ status: "success" });
    } catch (err) {
      return res.json({ error: err });
    }
  }
);

app.get(
  "/getFiles",
  auth.checkAuth,
  roleAuth.roleCheck([role.USER_ROLE.PROFESSIONAL]),
  async (req, res) => {
    try {
      const rid = req.session.data.user.id;
      const sharedFiles = await db.getFiles(rid);

      let files = [];
      const dir = "./db/uploads/";
      sharedFiles.forEach((file) => {
        files.push({
          path: dir + file.filename,
          name: file.filename,
        });
      });
      return res.zip(files);
    } catch (e) {
      console.log(e);
    }
  }
);

app.post("/logout", auth.checkAuth, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

createDB();
