import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import JSZip from "jszip";
import { Readable } from "stream";
import Note from "../Models/Note.js";
import Faculty from "../Models/Faculty.js";
import Student from "../Models/Student.js";

import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//notes
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.array("files")(req, res, (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Upload error", error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      if (req.user.role !== "faculty")
        return res
          .status(403)
          .json({ message: "Only faculty can upload notes" });

      const { regulation, subject, branch, semester } = req.body;
      if (
        !regulation ||
        !subject ||
        !branch ||
        !semester ||
        !req.files ||
        req.files.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "All fields and files are required" });
      }

      const savedNotes = [];
      for (const file of req.files) {
        const title = file.originalname.replace(/\.[^/.]+$/, "");

        const newNote = new Note({
          title,
          regulation,
          subject,
          branch,
          semester,
          file: { data: file.buffer, contentType: file.mimetype },
          uploadedBy: req.user.id,
        });

        const savedNote = await newNote.save();
        await Faculty.findByIdAndUpdate(req.user.id, {
          $push: { uploadedNotes: savedNote._id },
        });
        savedNotes.push({
          ...savedNote.toObject(),
          fileUrl: `/notes/${savedNote._id}`,
        });
      }

      res
        .status(201)
        .json({ message: "Notes uploaded successfully", notes: savedNotes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.get("/my-uploads", authMiddleware, async (req, res) => {
  try {
    // Fetch faculty and populate uploaded notes
    const faculty = await Faculty.findById(req.user.id).populate({
      path: "uploadedNotes",
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "branch", select: "name" },
        { path: "subject", select: "name code" },
        { path: "regulation", select: "name" },
      ],
    });

    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const notesWithUrl = faculty.uploadedNotes.map((note) => ({
      _id: note._id,
      title: note.title,
      semester: note.semester,
      branch: note.branch, // name
      subject: note.subject, // name & code
      regulation: note.regulation, // name
    }));

    res.json(notesWithUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- Download Note -------------------
// router.get("/:id", async (req, res) => {
//   try {
//     const note = await Note.findById(req.params.id);
//     if (!note) return res.status(404).json({ message: "Note not found" });

//     res.set("Content-Type", note.file.contentType);
//     res.send(note.file.data);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Error fetching note", error: error.message });
//   }
// });

//notes by sub
router.get("/subject/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject id" });
    }

    const notes = await Note.find({ subject: id })
      .populate("regulation", "name")
      .populate("branch", "name")
      .populate("subject", "name code")
      .populate("uploadedBy", "name email")
      .select("-file");

    if (!notes.length) {
      return res
        .status(404)
        .json({ message: "No notes found for this subject" });
    }

    res.json({ notes });
  } catch (err) {
    console.error("Error fetching notes by subject:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.set("Content-Type", note.file.contentType);
    res.set("Content-Disposition", `inline; filename="${note.title}"`);
    res.send(note.file.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching note", error: error.message });
  }
});

//zip download
router.post("/download-zip", async (req, res) => {
  try {
    const { noteIds } = req.body; // Array of note IDs
    if (!noteIds || !noteIds.length) {
      return res.status(400).json({ message: "No notes selected" });
    }

    const notes = await Note.find({ _id: { $in: noteIds } });

    if (!notes.length)
      return res.status(404).json({ message: "Notes not found" });

    const zip = new JSZip();

    notes.forEach((note) => {
      const fileName =
        note.title + (note.file?.contentType?.includes("pdf") ? ".pdf" : "");
      zip.file(fileName, note.file.data);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=notes.zip`,
      "Content-Length": zipBuffer.length,
    });

    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating ZIP", error: err.message });
  }
});

// ------------------- Add/Remove Favorites -------------------
// router.post("/:noteId/favorite", authMiddleware, async (req, res) => {
//   try {
//     const student = await Student.findById(req.user.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     if (!student.favoriteNotes.includes(req.params.noteId)) {
//       student.favoriteNotes.push(req.params.noteId);
//       await student.save();
//     }
//     res.json({
//       message: "Added to favorites",
//       favoriteNotes: student.favoriteNotes,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// router.delete("/:noteId/favorite", authMiddleware, async (req, res) => {
//   try {
//     const student = await Student.findById(req.user.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });

//     student.favoriteNotes = student.favoriteNotes.filter(
//       (id) => id.toString() !== req.params.noteId
//     );
//     await student.save();
//     res.json({
//       message: "Removed from favorites",
//       favoriteNotes: student.favoriteNotes,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

export default router;
