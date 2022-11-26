import { checkAuth } from "../controllers/basicAuth.js";
import { roleCheck } from "../controllers/role.js";
import * as roles from "../constants/role.js";
import * as db from "../db/queries.js";
import express from "express";
import * as logs from "logger";
let logger = logs.createLogger("./Bhamlo.log");
import fs from "fs";
export const router = express.Router();
router.use(checkAuth);
router.use(roleCheck([roles.USER_ROLE.ADMIN]));
router.get("/getapplications", async (req, res) => {
  try {
    const result = await db.getApplications(req.query.type);
    req.session.data.applications = result;
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});
router.post("/approve", async (req, res) => {
  try {
    const result = await db.approveApplication(req.body.id, req.body.type);
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});
router.get("/showall", async (req, res) => {
  try {
    const users = await db.getUsers();
    const orgs = await db.getOrgs();
    const data = {
      users: users,
      orgs: orgs,
    };
    req.session.data.all = data;
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const result = await db.deleteEntity(req.body.type, req.body.id);
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
});
router.post("/download", async (req, res) => {
  try {
    const myFiles = await db.getPOI(req.body.id);
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
      res.send("Oops! Seems like there are no documents");
    }
    let zipFilename = req.body.id.toString() + ".zip";
    res.zip(files, zipFilename);
  } catch (err) {
    console.log(err);
    logger.error(err);
    res.send("failed to get POI");
  }
});
