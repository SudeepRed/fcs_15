import * as bcrypt from "bcrypt";
import * as db from "../db/queries.js";
export async function validateUser(req, res, next) {
  const user =
    req.body.type == "user"
      ? await db.getUserbyEmail(req.body.email)
      : await db.getOrgbyDomain(req.body.email);

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      let updatedUser = delete user["password"];
      req.session.data = {};
      req.session.data.user = user;
      req.session.isLoggedIn = true;
      req.logout = () => {
        req.session.destroy();
      };
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Invalid Password for the given Email/Domain" });
    }
  } catch (e) {
    return res.status(403).json({ message: e });
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
