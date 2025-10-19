import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    regulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Regulation",
      required: true,
    },
  },
  { timestamps: true }
);

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
