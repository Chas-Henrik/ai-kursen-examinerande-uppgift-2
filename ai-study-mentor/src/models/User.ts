import { Schema, model, models } from "mongoose";

type UserDocument = {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, "Namn krävs"],
    },
    email: {
      type: String,
      required: [true, "E-post krävs"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Lösenord krävs"],
      minlength: 8,
    },
  },
  { timestamps: true },
);

export const User = models.User || model<UserDocument>("User", userSchema);
