import express from "express";
require("dotenv").config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen("3001", () => {
  console.log("Server Started");
});
