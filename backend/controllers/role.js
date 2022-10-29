export function roleCheck(roles) {
  return (req, res, next) => {
    if (roles.includes(req.session.user.role)) {
      next();
    } else {
      res.status(401);
      return res.send("You dont have permission to access this!");
    }
  };
}
