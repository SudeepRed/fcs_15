import * as application from "../constants/status.js";
export function statusCheck(req, res, next) {
  console.log(req.session);
  if (req.session.data.user.status == application.STATUS.APPROVED) {
    return next();
  } else {
    res.status(401);
    return res.send("Wait for admins approval!");
  }
}
