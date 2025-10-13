import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: Schema.Types.ObjectId;
  documentId: Schema.Types.ObjectId;
  documentName: string;
  pineconeIndexName: string;
  questionId: { type: Schema.Types.ObjectId; ref: "Question" };
  chatHistory: { text: string; isUser: boolean }[];
  createdAt: Date;
}

const SessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
  documentName: { type: String, required: true },
  pineconeIndexName: { type: String, required: true },
  questionId: { type: Schema.Types.ObjectId, ref: "Question" },
  chatHistory: [{ text: String, isUser: Boolean }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
