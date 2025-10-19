// backend/Routes/admin.js
import express from "express";
import mongoose from "mongoose";

import Regulation from "../Models/Regulation.js";
import Branch from "../Models/Branch.js";
import Subject from "../Models/Subject.js";
import Faculty from "../Models/Faculty.js";
import Student from "../Models/Student.js";
import Note from "../Models/Note.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ===== Admin Middleware =====
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// -------------------- Regulations CRUD --------------------
router.get(
  "/regulations",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const regs = await Regulation.find().sort({ createdAt: -1 });
      res.json(regs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/regulations",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, numberOfSemesters } = req.body;
      if (!name || !numberOfSemesters)
        return res
          .status(400)
          .json({ message: "Name and numberOfSemesters required" });
      const reg = new Regulation({ name, numberOfSemesters });
      const saved = await reg.save();
      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/regulations/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const updated = await Regulation.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ message: "Regulation not found" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/regulations/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const deleted = await Regulation.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ message: "Regulation not found" });
      res.json({ message: "Regulation deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------- Branches CRUD --------------------
router.get("/branches", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const branches = await Branch.find().populate("regulation", "name");
    res.json(branches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/branches", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, code, regulation } = req.body;
    if (!name || !code || !regulation)
      return res.status(400).json({ message: "All fields required" });
    const branch = new Branch({ name, code, regulation });
    const saved = await branch.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/branches/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const updated = await Branch.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ message: "Branch not found" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/branches/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const deleted = await Branch.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ message: "Branch not found" });
      res.json({ message: "Branch deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------- Subjects CRUD --------------------
router.get("/subjects", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("branch", "name")
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/subjects", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, code, branch, semester } = req.body;
    if (!name || !code || !branch || !semester)
      return res.status(400).json({ message: "All fields required" });
    const subject = new Subject({ name, code, branch, semester });
    const saved = await subject.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/subjects/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const updated = await Subject.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ message: "Subject not found" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/subjects/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });
      const deleted = await Subject.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ message: "Subject not found" });
      res.json({ message: "Subject deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------- Faculty CRUD --------------------
// -------------------- Faculty CRUD --------------------

// GET all faculty (exclude password)
router.get("/faculty", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .sort({ createdAt: -1 })
      .select("-password");
    res.json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create faculty with password hashing
router.post("/faculty", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, employeeId, designation } = req.body;
    if (!name || !email || !password || !employeeId || !designation)
      return res.status(400).json({ message: "Required fields missing" });

    // Check duplicates
    if (await Faculty.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });
    if (await Faculty.findOne({ employeeId }))
      return res.status(400).json({ message: "Employee ID already exists" });

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = new Faculty({
      name,
      email,
      password: hashedPassword,
      employeeId,
      designation,
    });

    const saved = await faculty.save();
    const savedWithoutPassword = saved.toObject();
    delete savedWithoutPassword.password;

    res.status(201).json(savedWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT edit faculty with password hashing and duplicate checks
// PUT edit faculty with duplicate checks for email and employeeId
router.put(
  "/faculty/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const { name, email, designation, password, employeeId } = req.body;

      const faculty = await Faculty.findById(id);
      if (!faculty)
        return res.status(404).json({ message: "Faculty not found" });

      // Check for duplicate email (excluding current faculty)
      if (email && email !== faculty.email) {
        const emailExists = await Faculty.findOne({
          email,
          _id: { $ne: id },
        });
        if (emailExists)
          return res.status(400).json({ message: "Email already exists" });
        faculty.email = email;
      }

      // Check for duplicate employeeId (excluding current faculty)
      if (employeeId && employeeId !== faculty.employeeId) {
        const empExists = await Faculty.findOne({
          employeeId,
          _id: { $ne: id },
        });
        if (empExists)
          return res
            .status(400)
            .json({ message: "Employee ID already exists" });
        faculty.employeeId = employeeId;
      }

      if (name) faculty.name = name;
      if (designation) faculty.designation = designation;

      if (password) {
        const bcrypt = await import("bcryptjs");
        faculty.password = await bcrypt.hash(password, 10);
      }

      const updated = await faculty.save();
      const updatedWithoutPassword = updated.toObject();
      delete updatedWithoutPassword.password;

      res.json(updatedWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// DELETE faculty
router.delete(
  "/faculty/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const deleted = await Faculty.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json({ message: "Faculty not found" });

      res.json({ message: "Faculty deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET uploads of a faculty
router.get(
  "/faculty/:id/uploads",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const faculty = await Faculty.findById(id).populate({
        path: "uploadedNotes",
        populate: [
          { path: "subject", select: "name code" },
          { path: "branch", select: "name" },
          { path: "regulation", select: "name" },
        ],
      });

      if (!faculty)
        return res.status(404).json({ message: "Faculty not found" });

      res.json(faculty.uploadedNotes || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// -------------------- Notes --------------------
router.get("/notes", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { regulation, branch, semester, subject } = req.query;
    const filter = {};
    if (regulation) filter.regulation = regulation;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    const notes = await Note.find(filter, "-file")
      .populate("regulation", "name")
      .populate("branch", "name")
      .populate("subject", "name code")
      .populate(
        "uploadedBy",
        "name email designation employeeId uploadedNotes"
      );

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/notes/:id/file",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note || !note.file || !note.file.data)
        return res.status(404).json({ message: "File not found" });

      res.set({
        "Content-Type": note.file.contentType,
        "Content-Disposition": `attachment; filename="${note.file.filename}"`,
      });

      res.send(note.file.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/notes/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      const deleted = await Note.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Note not found" });

      res.json({ message: "Note deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
