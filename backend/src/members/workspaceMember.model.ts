import mongoose from "mongoose";

export type WorkspaceMemberSchema = {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
};

const workspaceMemberSchema = new mongoose.Schema<WorkspaceMemberSchema>(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const WorkspaceMemberModel = mongoose.model<WorkspaceMemberSchema>(
  "WorkspaceMember",
  workspaceMemberSchema
);
