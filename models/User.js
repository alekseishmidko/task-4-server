import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "notActive"],
      default: "active",
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", UserSchema);
