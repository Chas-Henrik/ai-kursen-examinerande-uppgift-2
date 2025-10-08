import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interface för User-dokumentet
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Namn är obligatoriskt"],
      trim: true,
      maxlength: [50, "Namnet får inte vara längre än 50 tecken"],
    },
    email: {
      type: String,
      required: [true, "E-post är obligatorisk"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Vänligen ange en giltig e-postadress",
      ],
    },
    password: {
      type: String,
      required: [true, "Lösenord är obligatoriskt"],
      minlength: [6, "Lösenordet måste vara minst 6 tecken"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index för bättre prestanda
userSchema.index({ email: 1 });

// Pre-save middleware för lösenordshashning
userSchema.pre("save", async function (next) {
  // Hasha bara lösenordet om det har ändrats
  if (!this.isModified("password")) return next();

  try {
    // Hasha lösenordet med salt rounds 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method för lösenordsjämförelse
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exportera modellen
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
