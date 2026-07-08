const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB connect (replace your URI)
mongoose.connect("mongodb+srv://shikhahim89-del:zhZ2ZG97yDKQnSae@cluster0.mongodb.net/batchtrace-pro")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📦 Schema
const batchSchema = new mongoose.Schema({
  name: String,
  course: String,
  year: String
});

const Batch = mongoose.model("Batch", batchSchema);

// ✅ CREATE
app.post("/api/batches", async (req, res) => {
  const batch = new Batch(req.body);
  await batch.save();
  res.json(batch);
});

// ✅ READ
app.get("/api/batches", async (req, res) => {
  const data = await Batch.find();
  res.json(data);
});

// ✅ UPDATE
app.put("/api/batches/:id", async (req, res) => {
  const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// ✅ DELETE
app.delete("/api/batches/:id", async (req, res) => {
  await Batch.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// 🚀 Server
app.listen(5000, () => console.log("Server running on 5000"));