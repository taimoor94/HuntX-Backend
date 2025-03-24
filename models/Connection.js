import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  connectedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "connected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Connection", connectionSchema);