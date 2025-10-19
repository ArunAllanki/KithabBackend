import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // branch: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Branch",
  //   required: true,
  // },
  employeeId: { type: String, required: true, unique: true },
  designation: { type: String }, // e.g., Assistant Professor
  createdAt: { type: Date, default: Date.now },

  // optional - if you want a reverse link
  uploadedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
});

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;
