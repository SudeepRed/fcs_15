import * as bcrypt from "bcrypt";
import * as db from "../db/queries.js";
export async function validateUser(req, res, next) {
  const user = await db.getUserbyEmail(req.body.email);
  const org = await db.getOrgbyDomain(req.body.email);
  if (user == undefined && org == undefined) {
    return res.status(403).json({ message: "Invalid Credentials" });
  }
  if (user != undefined) {
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        let updatedUser = delete user['password'];
        req.session.data = {};
        req.session.data.user = user;
        console.log(req.session)

        req.session.isLoggedIn = true;
        req.logout = () => {
          req.session.destroy();
        };
        next();
      } else {
        return res
          .status(403)
          .json({ message: "Invalid Password for the given Email" });
      }
    } catch (e) {
      return res.status(403).json({ message: e });
    }
  } else {
    try {
      if (await bcrypt.compare(req.body.password, org.password)) {
        req.session.user = org;
        req.session.isLoggedIn = true;
        req.logout = () => {
          req.session.destroy();
        };
        next();
      } else {
        return res
          .status(403)
          .json({ message: "Invalid Password for the given Domain" });
      }
    } catch (e) {
      return res.status(403).json({ message: e });
    }
  }
}

export function checkAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return next();
  }

  res.redirect("/login");
}

export function checkNotAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }
  next();
}
