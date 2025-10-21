import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Faculty from "../Models/Faculty.js";
import Student from "../Models/Student.js";

const router = express.Router();

// Helper: Generate JWT
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

// -----------------------------
// Student Registration
// -----------------------------
router.post("/student/register", async (req, res) => {
  const { name, email, password, branch, rollNumber } = req.body;
  try {
    const exists = await Student.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      branch,
      rollNumber,
    });

    const token = generateToken(student._id, "student");
    res.status(201).json({
      message: "Student registered successfully",
      student: {
        id: student._id,
        name,
        email,
        branch,
        rollNumber,
        role: "student",
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Faculty Registration
// -----------------------------
router.post("/faculty/register", async (req, res) => {
  const { name, email, password, branch, employeeId, designation } = req.body;
  try {
    const exists = await Faculty.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = await Faculty.create({
      name,
      email,
      password: hashedPassword,
      branch,
      employeeId,
      designation,
    });

    const token = generateToken(faculty._id, "faculty");
    res.status(201).json({
      message: "Faculty registered successfully",
      faculty: {
        id: faculty._id,
        name,
        email,
        branch,
        employeeId,
        designation,
        role: "faculty",
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Student Login
// -----------------------------
router.post("/student/login", async (req, res) => {
  const { rollNumber, password } = req.body;
  try {
    const student = await Student.findOne({ rollNumber });
    if (!student)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(student._id, "student");
    res.json({
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        branch: student.branch,
        role: "student",
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Faculty Login
// -----------------------------
router.post("/faculty/login", async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const faculty = await Faculty.findOne({ employeeId });
    if (!faculty)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(faculty._id, "faculty");
    res.json({
      message: "Login successful",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        employeeId: faculty.employeeId,
        branch: faculty.branch,
        designation: faculty.designation,
        role: "faculty",
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Admin Login (.env credentials)
// -----------------------------
router.post("/admin/login", (req, res) => {
  const { adminId, password } = req.body;

  if (
    adminId === process.env.ADMIN_ID &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.json({
      message: "Login successful",
      admin: { name: "Admin", role: "admin" },
      token,
    });
  } else {
    return res.status(400).json({ message: "Invalid credentials" });
  }
});

export default router;
