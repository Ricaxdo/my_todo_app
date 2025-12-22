import mongoose from "mongoose";

export type WorkspaceSchema = {
  name: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string;
  isPersonal: boolean; // ✅ nuevo
};

function generateInviteCode(length = 8) {
  // simple, readable, sin caracteres raros
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

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
      required: true,
      unique: true,
      index: true,
    },
    isPersonal: {
      type: Boolean,
      default: false, // ✅ clave
      index: true,
    },
  },
  { timestamps: true }
);

// ⚠️ sigue generando inviteCode, incluso para personal (no pasa nada)
workspaceSchema.pre("validate", function () {
  if (!this.inviteCode) this.inviteCode = generateInviteCode();
});

export const WorkspaceModel = mongoose.model<WorkspaceSchema>(
  "Workspace",
  workspaceSchema
);
