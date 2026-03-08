import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  displayName: string;
  profilePicture: string;
  isPremium: boolean;
  projectName: string;
  projectDescription: string;
  defaultLanguage: string;
  timezone: string;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profilePicture: { type: String },
  isPremium: { type: Boolean, default: false },
  projectName: { type: String, default: "My First Project" },
  projectDescription: { type: String, default: "Contract analysis workspace" },
  defaultLanguage: { type: String, default: "English" },
  timezone: { type: String, default: "Asia/Kolkata" },
});

export default model<IUser>("User", UserSchema);
