import mongoose, { Schema, Document } from "mongoose";

export interface QuestionItem {
  question: string;
  answer?: string;
}

export interface IQuestion extends Document {
  questions: QuestionItem[];
  createdAt: Date;
}

const QuestionSchema: Schema = new Schema({
  questions: [{ type: Object, required: true }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
