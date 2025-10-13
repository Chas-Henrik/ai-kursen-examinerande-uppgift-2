import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: Schema.Types.ObjectId;
  filename: string;
  text: string;
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
