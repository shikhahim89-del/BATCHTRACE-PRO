const express = require("express");
const router = express.Router();

// ✅ TEST ROUTE
router.get("/", (req, res) => {
  res.json({ message: "Batches API working ✅" });
});

// ✅ ADD BATCH
router.post("/", (req, res) => {
  const { batchName, product, expiry } = req.body;

  if (!batchName || !product || !expiry) {
    return res.status(400).json({ error: "All fields required" });
  }

  res.json({
    message: "Batch added successfully ✅",
    data: { batchName, product, expiry },
  });
});

module.exports = router;