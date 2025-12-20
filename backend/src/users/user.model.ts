import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { env } from "../config/env";

type UserSchema = {
  name: string;
  lastName: string;
  phone: string; // guardaremos solo dígitos
  email: string;
  password: string;
};

type UserMethods = {
  comparePassword(candidate: string): Promise<boolean>;
};

const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const userSchema = new mongoose.Schema<
  UserSchema,
  mongoose.Model<UserSchema, {}, UserMethods>,
  UserMethods
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      validate: {
        validator: (v: string) => onlyLetters.test(v),
        message: "name must contain only letters",
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      validate: {
        validator: (v: string) => onlyLetters.test(v),
        message: "lastName must contain only letters",
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "phone must have 10 digits"],
    },
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
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model<
  UserSchema,
  mongoose.Model<UserSchema, {}, UserMethods>
>("User", userSchema);
