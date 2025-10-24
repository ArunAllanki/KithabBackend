import express from "express";
import Regulation from "../Models/Regulation.js";
import Branch from "../Models/Branch.js";
import Subject from "../Models/Subject.js";

const router = express.Router();

/* ========================
   REGULATIONS ROUTES
======================== */
// GET all regulations
router.get("/regulations", async (req, res) => {
  try {
    const regulations = await Regulation.find().sort({ name: 1 });
    res.json({ success: true, regulations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create a regulation
router.post("/regulations", async (req, res) => {
  try {
    const { name, numberOfSemesters } = req.body;
    if (!name || !numberOfSemesters)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const regulation = new Regulation({ name, numberOfSemesters });
    await regulation.save();
    res.json({ success: true, regulation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ========================
   BRANCHES ROUTES
======================== */
// GET all branches
router.get("/branches", async (req, res) => {
  try {
    const branches = await Branch.find()
      .sort({ name: 1 })
      .populate("regulation");
    res.json({ success: true, branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create a branch
router.post("/branches", async (req, res) => {
  try {
    const { name, code, regulation } = req.body;
    if (!name || !code || !regulation)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const branch = new Branch({ name, code, regulation });
    await branch.save();
    res.json({ success: true, branch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ========================
   SUBJECTS ROUTES
======================== */
// GET all subjects, optional filtering by branch or semester via query
router.get("/subjects", async (req, res) => {
  try {
    const { branch, sem } = req.query;
    let filter = {};
    if (branch) filter.branch = branch;
    if (sem) filter.semester = Number(sem);

    const subjects = await Subject.find(filter)
      .sort({ name: 1 })
      .populate("branch");
    res.json({ success: true, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create a subject
router.post("/subjects", async (req, res) => {
  try {
    const { name, code, branch, semester } = req.body;
    if (!name || !code || !branch || !semester)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const subject = new Subject({ name, code, branch, semester });
    await subject.save();
    res.json({ success: true, subject });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      // duplicate index error
      return res.status(400).json({
        success: false,
        message: "Subject code already exists for this branch and semester",
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
