import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import { WorkspaceMemberModel } from "../members/workspaceMember.model";
import { TaskModel } from "../tasks/task.model";
import { UserModel } from "../users/user.model";
import { WorkspaceModel } from "../workspaces/workspace.model";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

async function main() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("❌ MONGO_URI is not defined");
  }

  await mongoose.connect(mongoUri);

  await Promise.all([
    UserModel.deleteMany({}),
    TaskModel.deleteMany({}),
    WorkspaceModel.deleteMany({}),
    WorkspaceMemberModel.deleteMany({}),
  ]);

  console.log("✅ DB cleaned (users, tasks, workspaces, members)");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
