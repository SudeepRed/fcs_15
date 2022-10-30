import { checkAuth } from "../controllers/basicAuth.js";
import { roleCheck } from "../controllers/role.js";
import * as roles from "../constants/role.js";
import * as db from "../db/queries.js";
import express from "express";
export const router = express.Router();
router.use(checkAuth);
router.use(roleCheck([roles.USER_ROLE.ADMIN]));
router.get("/getapplications", async (req, res) => {
  try {
    const result = await db.getApplications();
    req.session.data.applications = result;

    
    return res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});
router.post("/approve", async (req, res) => {
    console.log(req.body.id);
    try {

      const result = await db.approveApplication(req.body.id);      
      return res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });
