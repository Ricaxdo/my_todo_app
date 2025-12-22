import mongoose from "mongoose";

export type WorkspaceSchema = {
  name: string;
  owner: mongoose.Types.ObjectId;
  inviteCode: string | null; // 👈 cambia a nullable
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
      default: null, // ✅ ya NO es required
      unique: true,
      sparse: true, // ✅ muy importante
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

//
// 👇 AQUÍ VA EL HOOK (JUSTO DESPUÉS DEL SCHEMA)
//
workspaceSchema.pre("validate", function () {
  if (this.isPersonal) {
    this.inviteCode = null; // ✅ personal nunca tiene código
    return;
  }

  if (!this.inviteCode) {
    this.inviteCode = generateInviteCode(); // ✅ solo shared
  }
});

//
// 👇 Y HASTA EL FINAL EXPORTAS EL MODELO
//
export const WorkspaceModel = mongoose.model<WorkspaceSchema>(
  "Workspace",
  workspaceSchema
);
