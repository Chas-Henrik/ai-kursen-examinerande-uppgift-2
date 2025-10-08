import mongoose, { Document, Model, Schema, Types } from "mongoose";

// Interface för Message sub-document
export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Interface för ChatSession-dokumentet
export interface IChatSession extends Document {
  userId: Types.ObjectId;
  documentId?: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  messageCount: number; // Virtual property
}

// Message sub-schema
const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      required: [true, "Meddelanderoll är obligatorisk"],
      enum: {
        values: ["user", "assistant"],
        message: 'Rollen måste vara antingen "user" eller "assistant"',
      },
    },
    content: {
      type: String,
      required: [true, "Meddelandeinnehåll är obligatoriskt"],
      trim: true,
      maxlength: [10000, "Meddelandet får inte vara längre än 10000 tecken"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ChatSession Schema
const chatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Användar-ID är obligatoriskt"],
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Sessionstitel är obligatorisk"],
      trim: true,
      maxlength: [200, "Titeln får inte vara längre än 200 tecken"],
      default: "Ny konversation",
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: {
        validator: function (messages: IMessage[]) {
          return messages.length <= 1000; // Max 1000 meddelanden per session
        },
        message: "För många meddelanden i sessionen",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index för snabba frågor
chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ userId: 1, documentId: 1 });

// Virtual för att räkna meddelanden
chatSessionSchema.virtual("messageCount").get(function (this: IChatSession) {
  return this.messages.length;
});

// Ensure virtual fields are serialised
chatSessionSchema.set("toJSON", {
  virtuals: true,
});

// Static methods för att hitta sessioner
chatSessionSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ userId })
    .populate("documentId", "filename fileType")
    .sort({ updatedAt: -1 });
};

chatSessionSchema.statics.findByDocument = function (
  userId: Types.ObjectId,
  documentId: Types.ObjectId
) {
  return this.find({ userId, documentId })
    .populate("documentId", "filename fileType")
    .sort({ updatedAt: -1 });
};

// Instance methods
chatSessionSchema.methods.addMessage = function (
  role: "user" | "assistant",
  content: string
) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
  });

  // Uppdatera titel baserat på första meddelandet
  if (this.messages.length === 1 && role === "user") {
    this.title =
      content.length > 50 ? content.substring(0, 50) + "..." : content;
  }

  return this.save();
};

chatSessionSchema.methods.getLastMessage = function (): IMessage | null {
  return this.messages.length > 0
    ? this.messages[this.messages.length - 1]
    : null;
};

// Pre-save middleware för att uppdatera updatedAt när meddelanden läggs till
chatSessionSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    this.updatedAt = new Date();
  }
  next();
});

// Exportera modellen
const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", chatSessionSchema);

export default ChatSession;
