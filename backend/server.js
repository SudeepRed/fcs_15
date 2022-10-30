import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as auth from "./controllers/basicAuth.js";
import session from "express-session";
import * as role from "./constants/role.js";
import * as roleAuth from "./controllers/role.js";

import * as user from "./apis/user.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view-engine", "ejs");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/user", user.router);
app.get(
  "/health",
  auth.checkAuth,
  roleAuth.roleCheck([role.USER_ROLE.ADMIN]),
  (req, res) => {
    res.render("health.ejs");
  }
);
app.get("/", auth.checkAuth, (req, res) => {
  res.render("index.ejs", { user: req.session.user });
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
});
app.post("/registerorg", auth.checkNotAuth, async (req, res) => {
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
});

app.post("/logout", auth.checkAuth, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

createDB();
