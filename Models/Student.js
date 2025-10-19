import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  favoriteNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }], // stores ONLY note IDs
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
