import { checkAuth } from "../controllers/basicAuth.js";
import { roleCheck } from "../controllers/role.js";
import * as roles from "../constants/role.js";
import * as db from "../db/queries.js";
import express from "express";
import { statusCheck } from "../controllers/status.js";
export const router = express.Router();
router.use(statusCheck);
router.use(checkAuth);

router.post(
  "/editprofile",
  roleCheck([
    roles.USER_ROLE.ADMIN,
    roles.USER_ROLE.PATIENT,
    roles.USER_ROLE.PROFESSIONAL,
  ]),
  async (req, res) => {
    let user = req.session.data.user;
    const data = req.body;
    user.name = data.name != "" ? data.name : user.name;
    user.age = data.age != "" ? data.age : user.age || 0;
    user.height = data.height != "" ? data.height : user.height || 0;
    user.weight = data.weight != "" ? data.weight : user.weight || 0;
    user.address = data.address != "" ? data.address : user.address || "";
    user.allergies =
      data.allergies != "" ? data.allergies : user.allergies || "";
    try {
      const result = await db.updateUser(user);
      return res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  }
);
router.get("/getdocuments", (req, res) => {
  res.send("edit");
});
router.get("/deletedocument", (req, res) => {
  res.send("edit");
});
router.get(
  "/getorgs",

  roleCheck([roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const result = await db.getOrgs();
      req.session.data.orgs = result;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/getprofessionals",
  roleCheck([roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const result = await db.getUsersByRole(roles.USER_ROLE.PROFESSIONAL);
      req.session.data.professionals = result;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  }
);
router.get("/getmedicines", (req, res) => {
  res.send("edit");
});
