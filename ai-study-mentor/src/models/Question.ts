import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  documentId: string;
  question: string;
  createdAt: Date;
}

const QuestionSchema: Schema = new Schema({
  documentId: { type: String, required: true },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
