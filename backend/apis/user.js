import { checkAuth } from "../controllers/basicAuth.js";
import { roleCheck } from "../controllers/role.js";
import * as roles from "../constants/role.js";
import * as db from "../db/queries.js";
import * as logs from "logger";
let logger = logs.createLogger("./Bhamlo.log");
import express from "express";
import { statusCheck } from "../controllers/status.js";
export const router = express.Router();
router.use(checkAuth);
router.use(statusCheck);

router.post(
  "/edituserprofile",
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
    user.location = data.location != "" ? data.location : user.location || "";
    try {
      const result = await db.updateUser(user);
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/editorgprofile",
  roleCheck([
    roles.ORG_ROLE.HOSPITAL,
    roles.ORG_ROLE.PHARMACY,
    roles.ORG_ROLE.INSURANCE,
  ]),
  async (req, res) => {
    let user = req.session.data.user;
    const data = req.body;
    user.name = data.name != "" ? data.name : user.name;
    user.location = data.location != "" ? data.location : user.location;
    user.contactDetails =
      data.contactDetails != "" ? data.contactDetails : user.contactDetails;
    user.description =
      data.description != "" ? data.description : user.description;

    try {
      const result = await db.updateOrg(user);
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);

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
      logger.error(err);
    }
  }
);
router.get(
  "/getprofessionals",
  roleCheck([roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const result = await db.search(
        req.query.type,
        req.query.name,
        req.query.location
      );
      req.session.data.professionals = result;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);

router.get(
  "/showdrugs",
  roleCheck([
    roles.USER_ROLE.PATIENT,
    roles.ORG_ROLE.PHARMACY,
    roles.ORG_ROLE.HOSPITAL,
  ]),
  async (req, res) => {
    try {
      const result = await db.getDrugs();
      req.session.data.drugs = result;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/buydrug",
  roleCheck([roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const data = await db.storeTransaction(
        req.session.data.user.id,
        req.body.did,
        req.body.vid,
        req.session.data.user.wallet
      );
      return res.send("Transaction Queued, waiting for Pharmacy approval!");
      // return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.get(
  "/showtransactions",
  roleCheck([roles.ORG_ROLE.PHARMACY, roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const data = await db.getTransaction(
        req.session.data.user.id,
        req.session.data.user.role
      );
      req.session.data.showtransactions = data;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/approvetransaction",
  roleCheck([roles.ORG_ROLE.PHARMACY]),
  async (req, res) => {
    try {
      const data = await db.buyDrug(req.body.id);
      if (data != null) {
        return res.send(data);
      }

      // return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/raiseClaim",
  roleCheck([roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      console.log(req);
      const data = await db.raiseClaim(req.body.trid, req.body.vid);
      if (data == null) {
        return res.send(
          "OOPS! Seems like the Claim cannot be initiated! Maybe try other ID's :) "
        );
      }
      return res.send("Success");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);

router.get(
  "/showclaims",
  roleCheck([roles.ORG_ROLE.INSURANCE, roles.USER_ROLE.PATIENT]),
  async (req, res) => {
    try {
      const data = await db.showClaims(
        req.session.data.user.id,
        req.session.data.user.role
      );
      req.session.data.claims = data;
      return res.redirect("/");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/refund",
  roleCheck([roles.ORG_ROLE.INSURANCE]),
  async (req, res) => {
    try {
      const data = await db.refundAmount(req.body.id);
      if (data == null) {
        return { msg: "Oops! Something went wrong :(" };
      }
      return res.send(data);
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
router.post(
  "/addDrug",
  roleCheck([roles.ORG_ROLE.PHARMACY]),
  async (req, res) => {
    try {
      const drugName = req.body.name;
      const price = req.body.price;
      const vid = req.session.data.user.id;
      const data = await db.insertDrug(drugName, price, vid);
      return res.send("Added Drug");
    } catch (err) {
      console.log(err);
      logger.error(err);
    }
  }
);
