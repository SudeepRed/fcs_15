import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as auth from "./controllers/auth.js";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import methodOverride from "method-override";
import * as role from "./constants/role.js";
dotenv.config();
const app = express();

auth.initialize(
  passport,
  (email) => db.getUserbyEmail(email),
  (id) => db.getUserbyId(id)
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view-engine", "ejs");
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/health", (req, res) => {
  res.render("health.ejs");
});
app.get("/", checkAuth, (req, res) => {
  res.render("index.ejs");
});
app.get("/login", checkNotAuth, (req, res) => {
  res.render("login.ejs");
});
app.post(
  "/login",
  checkNotAuth,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.get("/register", (req, res) => {
  res.render("register.ejs", { message: "" });
});
app.post("/register", checkNotAuth, async (req, res) => {
  try {
    console.log(role.USER_ROLE);
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
      db.createUser(user, "patient");
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

app.delete("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return err;
  });
  res.redirect("/login");
});
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

createDB();
