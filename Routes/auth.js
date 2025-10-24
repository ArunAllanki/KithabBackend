import dotenv from "dotenv";
dotenv.config(); // must be first line

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Faculty from "../Models/Faculty.js";
import Student from "../Models/Student.js";

const router = express.Router();

console.log("ENV CHECK:", process.env.SMTP_HOST, process.env.JWT_SECRET);

// -----------------------------
// Nodemailer transporter
// -----------------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true if using SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// optional: test connection
transporter.verify((error, success) => {
  if (error) console.error("[SMTP Connection Failed]", error);
  else console.log("[SMTP Ready: Gmail connected]");
});

// -----------------------------
// Helper: Generate JWT
// -----------------------------
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

// -----------------------------
// Student Registration
// -----------------------------
router.post("/student/register", async (req, res) => {
  const { name, email, password, branch, rollNumber } = req.body;

  try {
    // Validation: rollNumber format & length
    const rollRegex = /^(22ME|23ME|24ME|25ME)/;
    if (!rollRegex.test(rollNumber)) {
      return res.status(400).json({
        message: "Invalid Roll Number ",
      });
    }
    if (rollNumber.length !== 10) {
      return res.status(400).json({
        message: "Invalid Roll Number",
      });
    }

    // Check email
    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already used" });
    }

    // Check roll number
    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ message: "Roll Number already used" });
    }

    // Hash password
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
    // Validation: employeeId format & length
    const empRegex = /^RCEEME/;
    if (!empRegex.test(employeeId)) {
      return res.status(400).json({
        message: "Invalid Employee ID",
      });
    }
    if (employeeId.length !== 10) {
      return res.status(400).json({
        message: "Invalid Employee ID",
      });
    }

    // Check email
    const emailExists = await Faculty.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already used" });
    }

    // Check employee ID
    const empExists = await Faculty.findOne({ employeeId });
    if (empExists) {
      return res.status(400).json({ message: "Employee ID already used" });
    }

    // Hash password
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
// Login Routes
// -----------------------------
router.post("/student/login", async (req, res) => {
  const { rollNumber, password } = req.body;
  try {
    const student = await Student.findOne({ rollNumber });
    if (!student) return res.status(400).json({ message: "No user found" });

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

router.post("/faculty/login", async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const faculty = await Faculty.findOne({ employeeId });
    if (!faculty) return res.status(400).json({ message: "No user found" });

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

// -----------------------------
// Forgot Password
// -----------------------------
router.post("/forgot-password", async (req, res) => {
  const { role, id } = req.body; // id = rollNumber or employeeId
  try {
    let user;
    if (role === "student") user = await Student.findOne({ rollNumber: id });
    else if (role === "faculty")
      user = await Faculty.findOne({ employeeId: id });
    else return res.status(400).json({ message: "Invalid role" });

    if (!user) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id, role },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "5m" }
    );
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Kithab Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Hi ${user.name},</p>
             <p>Click below to reset your password (expires in 15 minutes):</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    res.json({ message: `Reset link sent to ${user.email}` });
  } catch (err) {
    console.error("[ForgotPassword]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Reset Password
// -----------------------------
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    let user;

    if (decoded.role === "student") user = await Student.findById(decoded.id);
    else if (decoded.role === "faculty")
      user = await Faculty.findById(decoded.id);

    if (!user) return res.status(400).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("[ResetPassword]", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

export default router;
