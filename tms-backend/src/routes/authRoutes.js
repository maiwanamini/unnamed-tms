import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("welcome to the homepage");
});

export default router;
