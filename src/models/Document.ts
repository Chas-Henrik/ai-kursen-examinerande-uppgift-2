import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  type: 'pdf' | 'url' | 'text';
}

const DocumentSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'url', 'text'],
    required: true,
  },
}, {
  timestamps: true,
});

export default models.Document || model<IDocument>('Document', DocumentSchema);
