import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  documentId: string;
  documentName: string;
  chatHistory: { text: string; isUser: boolean }[];
  createdAt: Date;
}

const SessionSchema: Schema = new Schema({
  userId: { type: String, required: true },
  documentId: { type: String, required: true },
  documentName: { type: String, required: true },
  chatHistory: [{ text: String, isUser: Boolean }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
