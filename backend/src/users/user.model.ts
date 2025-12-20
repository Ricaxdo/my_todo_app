import bcrypt from "bcrypt";
import mongoose, { InferSchemaType } from "mongoose";
import { env } from "../config/env";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model<User>("User", userSchema);
