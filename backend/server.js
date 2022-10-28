import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as auth from "./authController.js";
import passport from "passport";
import flash from "express-flash";
import session from "express-session";
import methodOverride from "method-override";
dotenv.config();
const app = express();

auth.initialize(
  passport,
  (email) => db.getUserbyEmail(email),
  (id) => db.getUserbyId(id)
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.get("/login", (req, res) => {
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
app.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = {
      id: Date.now(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      age: 1,
    };
    db.createUser(user, "patient");
    res.redirect("/login");
  } catch (error) {
    res.redirect("/register", { message: "Wrong credentials" });
    console.log(error);
  }
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
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
