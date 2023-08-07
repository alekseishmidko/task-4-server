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
    key: { type: Number, unique: true },
    dateOfCreate: { type: String },
    dateOfLastLogin: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("User", UserSchema);
