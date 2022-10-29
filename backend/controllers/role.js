export function roleCheck(role) {
  return (req, res, next) => {
    if (req.session.user.role != role) {
      res.status(401);
      return res.send("You dont have permission to access this!");
    }
    next();
  };
}
