import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Interface för Document-dokumentet
export interface IDocument extends Document {
  userId: Types.ObjectId;
  filename: string;
  originalText: string;
  chunks: string[];
  vectorIds: string[];
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  processed: boolean;
  chunkCount: number; // Virtual property
}

// Document Schema
const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Användar-ID är obligatoriskt"],
      index: true,
    },
    filename: {
      type: String,
      required: [true, "Filnamn är obligatoriskt"],
      trim: true,
      maxlength: [255, "Filnamnet får inte vara längre än 255 tecken"],
    },
    originalText: {
      type: String,
      required: [true, "Originaltext är obligatorisk"],
    },
    chunks: {
      type: [String],
      default: [],
      validate: {
        validator: function (chunks: string[]) {
          return chunks.length <= 1000; // Max 1000 chunks per dokument
        },
        message: "För många textdelar i dokumentet",
      },
    },
    vectorIds: {
      type: [String],
      default: [],
      validate: {
        validator: function (this: IDocument, vectorIds: string[]) {
          return vectorIds.length === this.chunks.length;
        },
        message: "Antalet vektor-IDn måste matcha antalet textdelar",
      },
    },
    fileType: {
      type: String,
      required: [true, "Filtyp är obligatorisk"],
      enum: {
        values: ["pdf", "txt", "docx", "doc"],
        message: "Filtypen {VALUE} stöds inte",
      },
    },
    fileSize: {
      type: Number,
      required: [true, "Filstorlek är obligatorisk"],
      min: [1, "Filen måste vara större än 0 bytes"],
      max: [10485760, "Filen får inte vara större än 10 MB"], // 10 MB
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index för snabba användarfrågor
documentSchema.index({ userId: 1, uploadDate: -1 });
documentSchema.index({ processed: 1 });

// Virtual för att räkna chunks
documentSchema.virtual("chunkCount").get(function (this: IDocument) {
  return this.chunks.length;
});

// Ensure virtual fields are serialised
documentSchema.set("toJSON", {
  virtuals: true,
});

// Static methods
documentSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ userId }).sort({ uploadDate: -1 });
};

documentSchema.statics.findProcessed = function (userId: Types.ObjectId) {
  return this.find({ userId, processed: true }).sort({ uploadDate: -1 });
};

// Instance methods
documentSchema.methods.markAsProcessed = function () {
  this.processed = true;
  return this.save();
};

// Exportera modellen
const DocumentModel: Model<IDocument> =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", documentSchema);

export default DocumentModel;
