import * as application from "../constants/status.js";
export function statusCheck(req, res, next) {
  if (req.session.data.user.role == "admin" || req.session.data.user.status == application.STATUS.APPROVED) {
    return next();
  } else {
    res.status(401);
    req.session.destroy();
    return res.send("Wait for admins approval!");
  }
}
