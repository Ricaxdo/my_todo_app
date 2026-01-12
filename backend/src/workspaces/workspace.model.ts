import mongoose, { HydratedDocument } from "mongoose";

export type WorkspaceSchema = {
  name: string;
  owner: mongoose.Types.ObjectId;
  inviteCode?: string;
  isPersonal: boolean;
};

function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

type WorkspaceDoc = HydratedDocument<WorkspaceSchema>;

const workspaceSchema = new mongoose.Schema<WorkspaceSchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      index: true,
    },
    isPersonal: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

workspaceSchema.pre("validate", function (this: WorkspaceDoc) {
  if (this.isPersonal) {
    delete this.inviteCode;
    return;
  }

  if (!this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }
});

export const WorkspaceModel = mongoose.model<WorkspaceSchema>(
  "Workspace",
  workspaceSchema
);
