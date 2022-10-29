import express from "express";
import dotenv from "dotenv";
import { createDB } from "./db/schema.js";
import * as db from "./db/queries.js";
import * as bcrypt from "bcrypt";
import * as bauth from "./controllers/basicAuth.js";
import session from "express-session";
import * as role from "./constants/role.js";
import * as roleAuth from "./controllers/role.js";
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

app.get(
  "/health",
  checkAuth,
  roleAuth.roleCheck(role.USER_ROLE.ADMIN),
  (req, res) => {
    res.render("health.ejs");
  }
);
app.get("/", checkAuth, (req, res) => {
  res.render("index.ejs");
});
app.get("/login", checkNotAuth, (req, res) => {
  res.render("login.ejs");
});
app.post("/login", checkNotAuth, bauth.validateUser, async (req, res) => {
  return res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register.ejs", {
    message: "",
  });
});
app.post("/register", checkNotAuth, async (req, res) => {
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

app.post("/logout", checkAuth, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

function checkAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
}

createDB();
