import mongoose from "mongoose";

const regulationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    numberOfSemesters: { type: Number, required: true },
  },
  { timestamps: true }
);

const Regulation = mongoose.model("Regulation", regulationSchema);
export default Regulation;
