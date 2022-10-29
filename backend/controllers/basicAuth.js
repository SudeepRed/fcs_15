import * as bcrypt from "bcrypt";
import * as db from "../db/queries.js";
export async function validateUser(req, res, next) {
  const user = await db.getUserbyEmail(req.body.email);
  if (user == null) {
    return res.status(403);
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.logout = () => {req.session.destroy()};
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Invalid Password for the given Emal" });
    }
  } catch (e) {
    return res.status(403).json({ message: e });
  }
}
